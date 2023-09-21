import { calculatePrice, calculateWorkTime, calculateDeadline, generateResponse, InvalidLanguage } from './Correctarium_Algo.js';



// calculatePrice tests
test("calculate price for english document with type doc and 9990 symbols", () => {
    const documentDetails = {
        language: "en",
        mimetype: "doc",
        count: 9990
    };

    expect(calculatePrice(documentDetails)).toEqual(1198.8);
});

test("calculate price for english document with type pdf (not doc|docx|rtf) and 9990 symbols", () => {
    const documentDetails = {
        language: "en",
        mimetype: "pdf",
        count: 9990
    };

    expect(calculatePrice(documentDetails)).toEqual(1438.56);
});

test("calculate price for english document with type doc and 100 symbols", () => {
    const documentDetails = {
        language: "en",
        mimetype: "doc",
        count: 100
    };

    expect(calculatePrice(documentDetails)).toEqual(120);
});

test("calculate price for ukrainian document with type doc and 9990 symbols", () => {
    const documentDetails = {
        language: "uk",
        mimetype: "doc",
        count: 9990
    };

    expect(calculatePrice(documentDetails)).toEqual(499.5);
});

test("calculate price for ukrainian document with type pdf (not doc|docx|rtf) and 9990 symbols", () => {
    const documentDetails = {
        language: "uk",
        mimetype: "pdf",
        count: 9990
    };

    expect(calculatePrice(documentDetails)).toEqual(599.4);
});

test("calculate price for ukrainian document with type doc and 100 symbols", () => {
    const documentDetails = {
        language: "uk",
        mimetype: "doc",
        count: 100
    };

    expect(calculatePrice(documentDetails)).toEqual(50);
});

test("calculate price for german (not ukrainian, not russian and not english) document (InvalidLanguage Error)", () => {
    const documentDetails = {
        language: "ge",
        mimetype: "doc",
        count: 9990
    };

    expect(() => calculatePrice(documentDetails)).toThrow(InvalidLanguage);
});



// calculateWorkTime tests
test("calculate work time for english document with type doc and 9990 symbols", () => {
    const documentDetails = {
        language: "en",
        mimetype: "doc",
        count: 9990
    };

    expect(calculateWorkTime(documentDetails)).toEqual(30.5);
});

test("calculate work time for english document with type pdf (not doc|docx|rtf) and 9990 symbols", () => {
    const documentDetails = {
        language: "en",
        mimetype: "pdf",
        count: 9990
    };

    expect(calculateWorkTime(documentDetails)).toEqual(36.6);
});

test("calculate work time for english document with type doc and 100 symbols", () => {
    const documentDetails = {
        language: "en",
        mimetype: "doc",
        count: 100
    };

    expect(calculateWorkTime(documentDetails)).toEqual(1);
});

test("calculate work time for ukrainian document with type doc and 9990 symbols", () => {
    const documentDetails = {
        language: "uk",
        mimetype: "doc",
        count: 9990
    };

    expect(calculateWorkTime(documentDetails)).toEqual(7.99);
});

test("calculate work time for ukrainian document with type pdf (not doc|docx|rtf) and 9990 symbols", () => {
    const documentDetails = {
        language: "uk",
        mimetype: "pdf",
        count: 9990
    };

    expect(calculateWorkTime(documentDetails)).toEqual(9.59);
});

test("calculate work time for ukrainian document with type doc and 100 symbols", () => {
    const documentDetails = {
        language: "uk",
        mimetype: "doc",
        count: 100
    };

    expect(calculateWorkTime(documentDetails)).toEqual(1);
});

test("calculate work time for german (not ukrainian, not russian and not english) document (InvalidLanguage Error)", () => {
    const documentDetails = {
        language: "ge",
        mimetype: "doc",
        count: 9990
    };

    expect(() => calculateWorkTime(documentDetails)).toThrow(InvalidLanguage);
});



// calculateDeadline tests
test("calculate deadline for english document with type doc and 9990 symbols on wednesday 20 at 9:30", () => {
    // wednesday 20
    const now = new Date(2023, 8, 20, 9, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "doc",
            count: 9990
        };

    expect(calculateDeadline(documentDetails, now)).toEqual(new Date(2023, 8, 25, 13, 30, 0, 0));
});

test("calculate deadline for english document with type doc and 9990 symbols on wednesday 20 at 19:30", () => {
    // wednesday 20
    const now = new Date(2023, 8, 20, 19, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "doc",
            count: 9990
        };

    expect(calculateDeadline(documentDetails, now)).toEqual(new Date(2023, 8, 26, 13, 30, 0, 0));
});

test("calculate deadline for english document with type doc and 9990 symbols on wednesday 20 at 15:30", () => {
    // wednesday 20
    const now = new Date(2023, 8, 20, 15, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "doc",
            count: 9990
        };

    expect(calculateDeadline(documentDetails, now)).toEqual(new Date(2023, 8, 25, 19, 0, 0, 0));
});

test("calculate deadline for english document with type pdf and 9990 symbols on wednesday 20 at 15:30", () => {
    // wednesday 20
    const now = new Date(2023, 8, 20, 15, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "pdf",
            count: 9990
        };

    expect(calculateDeadline(documentDetails, now)).toEqual(new Date(2023, 8, 26, 16, 6, 0, 0));
});

test("calculate deadline for english document with type pdf and 12345 symbols on wednesday 20 at 15:30", () => {
    // wednesday 20
    const now = new Date(2023, 8, 20, 15, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "pdf",
            count: 12345
        };

    expect(calculateDeadline(documentDetails, now)).toEqual(new Date(2023, 8, 27, 15, 35, 0, 0));
});

test("calculate deadline for english document with type doc and 9990 symbols on saturday 23 at 9:30", () => {
    // saturday 23
    const now = new Date(2023, 8, 23, 9, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "doc",
            count: 9990
        };

    expect(calculateDeadline(documentDetails, now)).toEqual(new Date(2023, 8, 28, 13, 30, 0, 0));
});

test("calculate deadline for english document with type doc and 9990 symbols on saturday 23 at 9:30", () => {
    // sunday 25
    const now = new Date(2023, 8, 24, 9, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "doc",
            count: 9990
        };

    expect(calculateDeadline(documentDetails, now)).toEqual(new Date(2023, 8, 28, 13, 30, 0, 0));
});

test("calculate deadline for german (not ukrainian, not russian and not english) document (InvalidLanguage Error)", () => {
    // wednesday 20
    const now = new Date(2023, 8, 20, 15, 30, 0, 0),
        documentDetails = {
            language: "ge",
            mimetype: "doc",
            count: 9990
        };

    expect(() => calculateDeadline(documentDetails, now)).toThrow(InvalidLanguage);
});

// generateResponse tests
test("generate response for ukrainian doc document at 9:30 on Wednesday 20", () => {
    const now = new Date(2023, 8, 20, 9, 30, 0, 0),
        documentDetails = {
            language: "uk",
            mimetype: "doc",
            count: 9990
        };

    expect(generateResponse(documentDetails, now)).toEqual({
        price: 499.5,
        time: 7.99,
        deadline: 1695221940,
        deadline_date: '09/20/2023, 17:59'
    });
});

test("generate response for english pdf document at 15:30 on Wednesday 20", () => {
    const now = new Date(2023, 8, 20, 15, 30, 0, 0),
        documentDetails = {
            language: "en",
            mimetype: "pdf",
            count: 9990
        };

    expect(generateResponse(documentDetails, now)).toEqual({
        price: 1438.56,
        time: 36.6,
        deadline: 1695733560,
        deadline_date: '09/26/2023, 16:06'
      });
});
