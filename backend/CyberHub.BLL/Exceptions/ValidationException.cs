namespace CyberHub.BLL.Exceptions;

public sealed class ValidationException : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; }

    public ValidationException(string field, string message)
        : base("Validation failed.")
        => Errors = new Dictionary<string, string[]> { [field] = [message] };

    public ValidationException(IDictionary<string, string[]> errors)
        : base("Validation failed.")
        => Errors = errors.AsReadOnly();
}
