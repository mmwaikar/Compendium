window.companyBarChart = {
    initialize(container, palette) {
        if (!container) {
            return;
        }

        const colors = Array.isArray(palette) && palette.length > 0
            ? palette
            : ["#0F6CBD"];

        const getBars = (svg) => {
            const pathBars = Array.from(svg.querySelectorAll("g.mud-charts-bar-series path.mud-chart-bar"))
                .map((bar) => {
                    const d = bar.getAttribute("d") ?? "";
                    const match = d.match(/M\s*([\d.]+)/);
                    const strokeWidth = Number(bar.getAttribute("stroke-width") ?? 0);

                    return match
                        ? {
                            element: bar,
                            centerX: Number(match[1]),
                            width: strokeWidth
                        }
                        : null;
                })
                .filter((bar) => bar !== null)
                .sort((left, right) => left.centerX - right.centerX);

            if (pathBars.length > 0) {
                return pathBars;
            }

            return Array.from(svg.querySelectorAll("rect"))
                .filter((rect) => {
                    const width = Number(rect.getAttribute("width") ?? 0);
                    const height = Number(rect.getAttribute("height") ?? 0);
                    return width >= 8 && width <= 40 && height > 6;
                })
                .map((rect) => ({
                    element: rect,
                    centerX: Number(rect.getAttribute("x") ?? 0),
                    width: Number(rect.getAttribute("width") ?? 0)
                }))
                .sort((left, right) => left.centerX - right.centerX);
        };

        const alignLabels = (svg, bars) => {
            const opticalOverlap = 15;
            const labels = Array.from(svg.querySelectorAll("g.mud-charts-xaxis text[transform*='rotate']"))
                .sort((left, right) => Number(left.getAttribute("x") ?? 0) - Number(right.getAttribute("x") ?? 0));

            labels.forEach((label, index) => {
                const bar = bars[index];
                if (!bar) {
                    return;
                }

                const y = Number(label.getAttribute("y") ?? 340);
                const rotationMatch = (label.getAttribute("transform") ?? "").match(/rotate\((-?[\d.]+)/);
                const rotation = rotationMatch ? Number(rotationMatch[1]) : -35;
                const labelEndX = bar.centerX - (bar.width / 2) + opticalOverlap;

                label.setAttribute("text-anchor", "end");
                label.setAttribute("x", `${labelEndX}`);
                label.setAttribute("transform", `rotate(${rotation} ${labelEndX} ${y})`);
            });
        };

        const applyColors = () => {
            const svg = container.querySelector("svg");
            if (!svg) {
                return;
            }

            const bars = getBars(svg);

            bars.forEach((bar, index) => {
                const color = colors[index % colors.length];
                bar.element.setAttribute("fill", color);
                bar.element.style.fill = color;

                if (bar.element.hasAttribute("stroke")) {
                    bar.element.setAttribute("stroke", color);
                    bar.element.style.stroke = color;
                }
            });

            alignLabels(svg, bars);
        };

        if (container._companyBarChartObserver) {
            container._companyBarChartObserver.disconnect();
        }

        const observer = new MutationObserver(() => {
            window.requestAnimationFrame(applyColors);
        });

        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true
        });

        container._companyBarChartObserver = observer;
        window.requestAnimationFrame(applyColors);
    }
};