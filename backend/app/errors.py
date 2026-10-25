class AppError(Exception):
    """Error that is safe to show to the user. Rendered as the standard error envelope."""

    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


class LLMError(AppError):
    def __init__(self, message: str, status_code: int = 502, code: str = "ai_error"):
        super().__init__(status_code, code, message)
