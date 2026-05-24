using System.Text.Json;
using Compendium.Domain;

namespace Compendium.Services;

public sealed class ResumeDataService(IWebHostEnvironment environment)
{
    private static readonly JsonSerializerOptions SerializerOptions =
        new() { PropertyNameCaseInsensitive = true };

    private readonly string _resumePath = Path.Combine(
        environment.WebRootPath,
        "data",
        "resume.json"
    );
    private Resume? _cachedResume;

    public async Task<Resume?> GetResumeAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedResume is not null)
        {
            return _cachedResume;
        }

        if (!File.Exists(_resumePath))
        {
            return null;
        }

        await using var stream = File.OpenRead(_resumePath);
        _cachedResume = await JsonSerializer.DeserializeAsync<Resume>(
            stream,
            SerializerOptions,
            cancellationToken
        );
        return _cachedResume;
    }
}
