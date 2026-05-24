using System.Net.Http.Json;
using System.Text.Json;
using Compendium.Domain;

namespace Compendium.Services;

public sealed class ResumeDataService(HttpClient httpClient)
{
    private const string ResumePath = "data/resume.json";

    private static readonly JsonSerializerOptions SerializerOptions =
        new() { PropertyNameCaseInsensitive = true };

    private Resume? _cachedResume;

    public async Task<Resume?> GetResumeAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedResume is not null)
        {
            return _cachedResume;
        }

        try
        {
            _cachedResume = await httpClient.GetFromJsonAsync<Resume>(
                ResumePath,
                SerializerOptions,
                cancellationToken
            );
        }
        catch (HttpRequestException)
        {
            return null;
        }

        return _cachedResume;
    }
}
