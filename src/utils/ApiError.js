class ApiError extends Error {
    constructor(
        statusCode,
        message="Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export default ApiError


// So, when you execute Error.captureStackTrace(this, this.constructor);, you're telling JavaScript to capture the current call stack into the custom error object (this) and associate it with that object. This ensures that when the error object is created, it includes a stack trace indicating where the error occurred in the code.

// This line of code is typically used in custom error classes (like ApiError) to ensure that instances of those classes include useful stack trace information for debugging purposes. It's particularly helpful when you want to create custom error objects with meaningful stack traces that point to the source of the error in your code.





