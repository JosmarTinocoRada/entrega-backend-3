
export class CustomError extends Error {
    constructor(code, message, details = null) {
        super(message);
        this.code = code;
        this.details = details;
    }
}

export const errorDictionary = {
    INCOMPLETE_VALUES: {
        code: 400,
        message: 'Incomplete values provided',
    },
    PET_NOT_FOUND: {
        code: 404,
        message: 'Pet not found',
    },
    USER_NOT_FOUND: {
        code: 404,
        message: 'User not found',
    },
    INVALID_ROLE: {
        code: 400,
        message: 'Invalid user role provided',
    },
    DATABASE_ERROR: {
        code: 500,
        message: 'Database error occurred',
    },
    MOCKING_ERROR: {
        code: 500,
        message: 'Error generating mock data',
    },
    VALIDATION_ERROR: {
        code: 400,
        message: 'Validation failed: Missing or invalid fields',
    },
    MISSING_PARAMETERS: {
        code: 400,
        message: 'Missing required parameters'
    },
    
};


export const handleError = (error, res) => {
    const { code, message, details } = error;
    res.status(code).json({ status: 'error', message, details });
};

