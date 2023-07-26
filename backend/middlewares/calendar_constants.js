const { google } = require('googleapis');

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCg+kDPLRbbLTe2\nLz7mdCab2eDxSSI3vB/DOZ/y3V5uALGeeiiaZb1dx7sOEpFqopQV2XlL7E4ViAe8\nAJB/HBWgycAd7kqXKfVAlU9OvuSGBK497DH5zVUDPky+7ffdIg+/x5AxCCppK+nW\njqIW7h3OuHQFu9tP4HZfY3eWL1t05eNTCujkAqiVru3blaZf48RdnS/7s94Rr4U4\nnkKuDYGGxK157ZHNPXyzfpsE8+qDWMfGzGAIhi+vYI2OyVG2hKj69Kc4BcebHwTE\n5wVwaQjbzqQ2Qe0msyaJ7veBgUnhzsiNgmlgmHBxzIEWNJOSJdjcoI7/C96M/HyF\n5R/5lFrVAgMBAAECggEAEpFS/OKTRpQkXy37aBsBIgxjSwl3uiyHkF3a8mkwvWj0\nk9Y8zTRLf5/sVj7ziXR3tr53JHf8+LRQShHZmOO9JebnczxbW6zCBmFCfM99bezn\nySoviIPz2JQsx4AMzTOi0+jZm6I4vBlN10rr7M+p3gB+F3Q343J9TNrc/hR3zNeR\ncHS0WdzugiZi6h5I5eyAGDRYFrhRZF1gMKPnAQMoqltDziv81aNhsXP2iket36UB\nUF8ae3+Q73z+IRfVHiKUJ/MxZfcZBi3wrvXkYleZafaE+dhNwKXAHwM5JEY352vx\nSzGcg+pb2cVxIlFgGx/wXqMR5ZPmovYIAXZYv6Ba+QKBgQDYRq0zQmH5uxOdrXv+\nb2szK5+IainoQsoXHKIW+fqzbBXIYF3etmXjByH8YBF+n3cEdTGfTP6pSFBMiEKI\njAY2vq+MSmZyO6wrsdimxNEA/ogaxi5+SVIlaqA43FY3cuGrtTUACSApY+joy8i8\naO1J8KZyXyL0rZYCMzB0FisG7QKBgQC+i28hq18W3rVAkVqnAmowxb2sEgu66M2N\niUZ50VhM1oWsvagVLV9fvAlPYaUcVkAy+nzP3fpMZakWGy1upvyEyvxKV+s1zPAd\nGxAV1X6wwD8QJMHjr7x3f+6WBfP1NfpFTS0sMjJCbVrzGfwAUyuwgW/wMA7WA9nk\nwUhWChl+iQKBgQDATRdznHLBOjYW3UqC0U7gEMmo4byhZ8GJC0yUYXEoV9KGeCj+\n/e9aDd2KKWFk1SVeMVYN7sgAfOvpIL8H6nkb9DDi7MRqjeRodZnNrvKnj6o1JEHy\nx/7ihgwwgrmmU9+UbWrSvUp7gvp1A71YyXMza2aUC0Npi272Rc2vaoaXgQKBgBRS\nruG6c4Pu8QoX9sFFYqodDSPjMNkYp4PnFls71t0rLErGV70af8eoOJ383i1tjZ9i\nVBmfpWislyJCd9ALg3duZwZO5klwuFOCZW7OvJqBhrhkE0IDpmhgfsQFkoWe4jiu\nCJlkKTQokcDIDrbCKDDFPXkyxwJQmtbpPpveq+VxAoGAYOYy7DvBQ3HMHclkRjdT\n0VUWCbP5waJcw+wxCaNcBjFZjJ8vw+F9qdL6EesSHnZZhbiuV79z8iKiEeSStfc6\nUqXOGIaDjAt1rgFrk+rvpL97DEjZRu9c0ESsLnJ3JesSsVcttPmvvGL7maO2CqBi\nOgv/8iRjcnbciWFOl24XHsA=\n-----END PRIVATE KEY-----"
const GOOGLE_CLIENT_EMAIL = "calendar-key@unisurvey-387811.iam.gserviceaccount.com"
const GOOGLE_PROJECT_NUMBER = "508271235294"
const GOOGLE_CALENDAR_ID = "4d30161fb001f9645072b63bf3095f88b6b9937d716ee7b4d4125b47b1809492@group.calendar.google.com"

const jwtClient = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY,
    SCOPES
);

const calendar = google.calendar({
    version: 'v3',
    project: GOOGLE_PROJECT_NUMBER,
    auth: jwtClient
}); 

module.exports = Object.freeze({
    SCOPES,
    GOOGLE_PRIVATE_KEY,
    GOOGLE_CLIENT_EMAIL,
    GOOGLE_PROJECT_NUMBER,
    GOOGLE_CALENDAR_ID,
    jwtClient,
    calendar
});
