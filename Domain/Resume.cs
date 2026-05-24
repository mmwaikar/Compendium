using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace Compendium.Domain;

public record Resume(
    [property: JsonPropertyName("basics")] Basics? Basics,
    [property: JsonPropertyName("work")] IReadOnlyList<Work>? Work,
    [property: JsonPropertyName("volunteer")] IReadOnlyList<Volunteer>? Volunteer,
    [property: JsonPropertyName("education")] IReadOnlyList<Education>? Education,
    [property: JsonPropertyName("awards")] IReadOnlyList<Award>? Awards,
    [property: JsonPropertyName("certificates")] IReadOnlyList<Certificate>? Certificates,
    [property: JsonPropertyName("publications")] IReadOnlyList<Publication>? Publications,
    [property: JsonPropertyName("skills")] IReadOnlyList<Skill>? Skills,
    [property: JsonPropertyName("languages")] IReadOnlyList<Language>? Languages,
    [property: JsonPropertyName("interests")] IReadOnlyList<Interest>? Interests,
    [property: JsonPropertyName("references")] IReadOnlyList<Reference>? References,
    [property: JsonPropertyName("projects")] IReadOnlyList<Project>? Projects
);

public record Basics(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("label")] string? Label,
    [property: JsonPropertyName("picture")] string? Picture,
    [property: JsonPropertyName("email")] string? Email,
    [property: JsonPropertyName("phone")] string? Phone,
    [property: JsonPropertyName("website")] string? Website,
    [property: JsonPropertyName("summary")] string? Summary,
    [property: JsonPropertyName("location")] Location? Location,
    [property: JsonPropertyName("profiles")] IReadOnlyList<Profile>? Profiles
);

public record Location(
    [property: JsonPropertyName("address")] string? Address,
    [property: JsonPropertyName("postalCode")] string? PostalCode,
    [property: JsonPropertyName("city")] string? City,
    [property: JsonPropertyName("countryCode")] string? CountryCode,
    [property: JsonPropertyName("region")] string? Region
);

public record Profile(
    [property: JsonPropertyName("network")] string? Network,
    [property: JsonPropertyName("username")] string? Username,
    [property: JsonPropertyName("url")] string? Url
);

public record Work(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("position")] string? Position,
    [property: JsonPropertyName("website")] string? Website,
    [property: JsonPropertyName("startDate")] string? StartDate,
    [property: JsonPropertyName("endDate")] string? EndDate,
    [property: JsonPropertyName("summary")] string? Summary,
    [property: JsonPropertyName("highlights")] IReadOnlyList<string>? Highlights
);

public record Volunteer(
    [property: JsonPropertyName("organization")] string? Organization,
    [property: JsonPropertyName("position")] string? Position,
    [property: JsonPropertyName("url")] string? Url,
    [property: JsonPropertyName("startDate")] string? StartDate,
    [property: JsonPropertyName("endDate")] string? EndDate,
    [property: JsonPropertyName("summary")] string? Summary,
    [property: JsonPropertyName("highlights")] IReadOnlyList<string>? Highlights
);

public record Education(
    [property: JsonPropertyName("institution")] string? Institution,
    [property: JsonPropertyName("area")] string? Area,
    [property: JsonPropertyName("studyType")] string? StudyType,
    [property: JsonPropertyName("startDate")] string? StartDate,
    [property: JsonPropertyName("endDate")] string? EndDate,
    [property: JsonPropertyName("gpa")] string? Gpa,
    [property: JsonPropertyName("courses")] IReadOnlyList<string>? Courses
);

public record Award(
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("date")] string? Date,
    [property: JsonPropertyName("awarder")] string? Awarder,
    [property: JsonPropertyName("summary")] string? Summary
);

public record Certificate(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("date")] string? Date,
    [property: JsonPropertyName("issuer")] string? Issuer,
    [property: JsonPropertyName("url")] string? Url
);

public record Publication(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("publisher")] string? Publisher,
    [property: JsonPropertyName("releaseDate")] string? ReleaseDate,
    [property: JsonPropertyName("url")] string? Url,
    [property: JsonPropertyName("summary")] string? Summary
);

public record Skill(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("level")] string? Level,
    [property: JsonPropertyName("keywords")] IReadOnlyList<string>? Keywords
);

public record Language(
    [property: JsonPropertyName("language")] string? LanguageName,
    [property: JsonPropertyName("fluency")] string? Fluency
);

public record Interest(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("keywords")] IReadOnlyList<string>? Keywords
);

public record Reference(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("reference")] string? ReferenceText
);

public record Project(
    [property: JsonPropertyName("name")] string? Name,
    [property: JsonPropertyName("startDate")] string? StartDate,
    [property: JsonPropertyName("endDate")] string? EndDate,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("highlights")] IReadOnlyList<string>? Highlights,
    [property: JsonPropertyName("url")] string? Url
);
