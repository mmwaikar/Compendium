const createBaseStyles = () => ([
    {
        selector: "node",
        style: {
            "background-color": "#0F6CBD",
            color: "#14304d",
            label: "data(label)",
            shape: "round-rectangle",
            width: "label",
            height: "label",
            padding: "8px",
            "text-wrap": "wrap",
            "text-max-width": "120px",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "8px",
            "font-family": "Segoe UI Variable, Segoe UI, sans-serif",
            "border-width": 1,
            "border-color": "#b9c9df"
        }
    },
    {
        selector: 'node[type = "root"]',
        style: {
            "background-color": "#dfeeff",
            color: "#14304d",
            "font-size": "10px",
            "font-weight": 700,
            "text-max-width": "130px",
            padding: "9px",
            "border-color": "#91b4dd"
        }
    },
    {
        selector: "edge",
        style: {
            width: 1.5,
            "line-color": "#9ab7d7",
            "target-arrow-color": "#9ab7d7",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier"
        }
    },
    {
        selector: ".is-hidden",
        style: {
            display: "none"
        }
    }
]);

const createElements = (graphData) => {
    const nodes = Array.isArray(graphData?.nodes) ? graphData.nodes : [];
    const edges = Array.isArray(graphData?.edges) ? graphData.edges : [];

    return {
        nodes,
        edges,
        elements: [
            ...nodes.map((node) => ({
                data: {
                    id: node.id,
                    type: node.type,
                    baseLabel: node.baseLabel,
                    detailLabel: node.detailLabel,
                    label: node.detailLabel
                }
            })),
            ...edges.map((edge) => ({
                data: {
                    id: edge.id,
                    source: edge.source,
                    target: edge.target
                }
            }))
        ]
    };
};

const initializeExpandableGraph = (container, graphData, config) => {
    if (!container) {
        return;
    }

    if (typeof window.cytoscape === "undefined") {
        container.textContent = "Cytoscape could not be loaded.";
        return;
    }

    if (container[config.stateKey]?.cy) {
        container[config.stateKey].resizeObserver?.disconnect();
        container[config.stateKey].cy.destroy();
    }

    const { nodes, edges, elements } = createElements(graphData);
    const expandedState = new Map();
    const childMap = new Map();

    nodes.forEach((node) => {
        expandedState.set(node.id, node.type === "root");
    });

    edges.forEach((edge) => {
        if (!childMap.has(edge.source)) {
            childMap.set(edge.source, []);
        }

        childMap.get(edge.source).push(edge.target);
    });

    const cy = window.cytoscape({
        container,
        elements,
        minZoom: config.minZoom ?? 0.45,
        maxZoom: config.maxZoom ?? 2.4,
        style: config.style
    });

    const updateExpandableLabel = (node) => {
        const nodeType = node.data("type");
        const isExpandable = config.expandableTypes.has(nodeType);
        if (!isExpandable) {
            node.data("label", node.data("detailLabel"));
            return;
        }

        const prefix = expandedState.get(node.id()) ? "-" : "+";
        node.data("label", `${prefix} ${node.data("detailLabel")}`);
    };

    const collectVisibleNodes = (nodeId, visibleNodes) => {
        visibleNodes.add(nodeId);

        if (!expandedState.get(nodeId)) {
            return;
        }

        const children = childMap.get(nodeId) ?? [];
        children.forEach((childId) => collectVisibleNodes(childId, visibleNodes));
    };

    const applyViewport = (options) => {
        const visibleElements = cy.elements(":visible");
        if (visibleElements.length === 0) {
            return;
        }

        if (options?.nodeId && config.focusTypes.has(options.nodeType)) {
            const focusNode = cy.getElementById(options.nodeId);
            if (focusNode.length > 0 && focusNode.visible()) {
                const focusedElements = focusNode
                    .closedNeighborhood(":visible")
                    .union(focusNode.successors(":visible"));

                if (focusedElements.length > 0) {
                    const previousZoom = cy.zoom();
                    cy.fit(focusedElements, config.focusFitPadding ?? 22);

                    const minReadableZoom = Math.max(0.78, Math.min(1.15, previousZoom || 1));
                    if (cy.zoom() < minReadableZoom) {
                        cy.zoom(minReadableZoom);
                        cy.center(focusedElements);
                    }

                    return;
                }
            }
        }

        cy.fit(visibleElements, config.fitPadding ?? 16);

        const minGlobalZoom = config.minGlobalZoom ?? 0.6;
        if (cy.zoom() < minGlobalZoom) {
            cy.zoom(minGlobalZoom);
            cy.center(visibleElements);
        }
    };

    let layoutReady = false;

    const refreshGraph = (options) => {
        if (config.layoutStrategy === "static" && !layoutReady) {
            const initialLayout = config.createLayout(cy, config, cy.elements());
            if (!initialLayout) {
                return;
            }

            initialLayout.one("layoutstop", () => {
                layoutReady = true;
                refreshGraph({ interaction: "post-layout" });
            });
            initialLayout.run();
            return;
        }

        cy.nodes().forEach(updateExpandableLabel);

        const visibleNodes = new Set();
        collectVisibleNodes(config.rootId, visibleNodes);

        cy.nodes().forEach((node) => {
            node.toggleClass("is-hidden", !visibleNodes.has(node.id()));
        });

        cy.edges().forEach((edge) => {
            const isVisible = visibleNodes.has(edge.source().id()) && visibleNodes.has(edge.target().id());
            edge.toggleClass("is-hidden", !isVisible);
        });

        if (config.layoutStrategy === "static") {
            window.requestAnimationFrame(() => applyViewport(options));
            return;
        }

        const layout = config.createLayout(cy, config, cy.elements(":visible"));
        if (!layout) {
            return;
        }

        layout.one("layoutstop", () => {
            window.requestAnimationFrame(() => applyViewport(options));
        });
        layout.run();
    };

    cy.on("tap", "node", (event) => {
        const node = event.target;
        const type = node.data("type");

        if (!config.expandableTypes.has(type)) {
            return;
        }

        expandedState.set(node.id(), !expandedState.get(node.id()));
        refreshGraph({ interaction: `${type}-toggle`, nodeId: node.id(), nodeType: type });
    });

    const resizeObserver = new ResizeObserver(() => {
        cy.resize();
        refreshGraph({ interaction: "resize" });
    });

    resizeObserver.observe(container);
    refreshGraph({ interaction: "initial" });
    container[config.stateKey] = { cy, resizeObserver };
};

const createCountryStyle = () => [
    ...createBaseStyles(),
    {
        selector: 'node[type = "country"]',
        style: {
            "background-color": "#edf4ff",
            color: "#1e456b",
            "font-size": "9px",
            "font-weight": 700,
            "text-max-width": "125px"
        }
    },
    {
        selector: 'node[type = "company"]',
        style: {
            "background-color": "#ffffff",
            color: "#214160",
            "font-size": "8px",
            "font-weight": 600,
            padding: "6px",
            "text-max-width": "100px"
        }
    }
];

const createSkillsStyle = () => [
    ...createBaseStyles(),
    {
        selector: 'node[type = "skill"]',
        style: {
            "background-color": "#eaf3ff",
            color: "#1f496f",
            "font-size": "9px",
            "font-weight": 700,
            "text-max-width": "120px"
        }
    },
    {
        selector: 'node[type = "keyword"]',
        style: {
            "background-color": "#ffffff",
            color: "#264768",
            "font-size": "8px",
            "font-weight": 600,
            padding: "6px",
            "text-max-width": "96px"
        }
    }
];

window.countryGraph = {
    initialize(container, graphData) {
        initializeExpandableGraph(container, graphData, {
            stateKey: "_countryGraphState",
            rootId: "countries-root",
            layoutStrategy: "static",
            expandableTypes: new Set(["root", "country"]),
            focusTypes: new Set(["country"]),
            style: createCountryStyle(),
            createLayout: (cy, config, layoutElements) => {
                const targetElements = layoutElements ?? cy.elements(":visible");
                if (targetElements.length === 0) {
                    return null;
                }

                return targetElements.layout({
                    name: "breadthfirst",
                    animate: false,
                    fit: false,
                    directed: true,
                    roots: `#${config.rootId}`,
                    circle: true,
                    grid: false,
                    padding: 10,
                    avoidOverlap: true,
                    nodeDimensionsIncludeLabels: true,
                    spacingFactor: 0.82,
                    minNodeSpacing: 14
                });
            }
        });
    }
};

window.skillsGraph = {
    initialize(container, graphData) {
        initializeExpandableGraph(container, graphData, {
            stateKey: "_skillsGraphState",
            rootId: "skills-root",
            layoutStrategy: "static",
            expandableTypes: new Set(["root", "skill"]),
            focusTypes: new Set(["skill"]),
            style: createSkillsStyle(),
            minGlobalZoom: 0.55,
            createLayout: (cy, config, layoutElements) => {
                const targetElements = layoutElements ?? cy.elements(":visible");
                if (targetElements.length === 0) {
                    return null;
                }

                return targetElements.layout({
                    name: "breadthfirst",
                    animate: false,
                    fit: false,
                    directed: true,
                    roots: `#${config.rootId}`,
                    circle: true,
                    grid: false,
                    padding: 20,
                    avoidOverlap: true,
                    nodeDimensionsIncludeLabels: true,
                    spacingFactor: 1.08,
                    minNodeSpacing: 24
                });
            }
        });
    }
};