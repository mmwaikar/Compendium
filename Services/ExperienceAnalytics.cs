using Compendium.Domain;

namespace Compendium.Services;

public static class ExperienceAnalytics
{
    public static IReadOnlyList<CompanyExperienceSummary> GroupByCompany(
        IEnumerable<Work>? workItems
    )
    {
        return GroupCompanySummaries(workItems ?? []);
    }

    public static IReadOnlyList<CountryExperienceSummary> GroupByCountry(
        IEnumerable<Work>? workItems
    )
    {
        return (workItems ?? [])
            .Where(static work => !string.IsNullOrWhiteSpace(work.Name))
            .GroupBy(static work => ExtractCountry(work.Name!))
            .Select(group =>
            {
                var entries = group.ToArray();
                var companies = GroupCompanySummaries(entries);

                return new CountryExperienceSummary(
                    group.Key,
                    companies,
                    companies.Count,
                    companies.Sum(static company => company.TotalMonths),
                    companies.Min(static company => company.EarliestStartDate) ?? DateOnly.MaxValue
                );
            })
            .OrderBy(static summary => summary.CountryName)
            .ToArray();
    }

    public static int CalculateMonths(string? startDate, string? endDate)
    {
        if (!DateOnly.TryParse(startDate, out var start))
        {
            return 0;
        }

        var resolvedEnd = DateOnly.TryParse(endDate, out var parsedEnd)
            ? parsedEnd
            : DateOnly.FromDateTime(DateTime.Today);

        if (resolvedEnd < start)
        {
            return 0;
        }

        var months = ((resolvedEnd.Year - start.Year) * 12) + resolvedEnd.Month - start.Month;
        return Math.Max(1, months + 1);
    }

    private static string ExtractCompanyName(string rawName)
    {
        var segments = rawName.Split(
            ',',
            StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries
        );

        return segments.Length > 0 ? segments[0] : rawName.Trim();
    }

    private static string ExtractCountry(string rawName)
    {
        var segments = rawName.Split(
            ',',
            StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries
        );

        if (segments.Length == 0)
        {
            return "Unspecified";
        }

        var country = segments[^1];

        return country switch
        {
            "USA" => "United States",
            "US" => "United States",
            _ => country
        };
    }

    private static IReadOnlyList<CompanyExperienceSummary> GroupCompanySummaries(
        IEnumerable<Work> workItems
    )
    {
        return workItems
            .Where(static work => !string.IsNullOrWhiteSpace(work.Name))
            .GroupBy(static work => ExtractCompanyName(work.Name!))
            .Select(group =>
            {
                var entries = group.ToArray();
                return new CompanyExperienceSummary(
                    group.Key,
                    group.Sum(static work => CalculateMonths(work.StartDate, work.EndDate)),
                    group.Count(),
                    GetEarliestStart(entries),
                    entries
                );
            })
            .OrderBy(static summary => summary.EarliestStartDate ?? DateOnly.MaxValue)
            .ThenBy(static summary => summary.CompanyName)
            .ToArray();
    }

    private static DateOnly? GetEarliestStart(IEnumerable<Work> entries)
    {
        return entries
            .Select(
                static entry =>
                    DateOnly.TryParse(entry.StartDate, out var start) ? start : (DateOnly?)null
            )
            .Where(static start => start.HasValue)
            .Select(static start => start!.Value)
            .OrderBy(static start => start)
            .Cast<DateOnly?>()
            .FirstOrDefault();
    }
}

public sealed record CompanyExperienceSummary(
    string CompanyName,
    int TotalMonths,
    int RoleCount,
    DateOnly? EarliestStartDate,
    IReadOnlyList<Work> Entries
);

public sealed record CountryExperienceSummary(
    string CountryName,
    IReadOnlyList<CompanyExperienceSummary> Companies,
    int CompanyCount,
    int TotalMonths,
    DateOnly SortKey
);
