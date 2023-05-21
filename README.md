#UniSurvey

This project is the result of the course Ingegneria del Software,
UniSurvey is an utility web service with the focus on improving students life with surveys and in-campus functionalities.

# packages used (the order is randomic):
* express: provides broad features for building web and mobile applications, is a MUST for developing application like this
* bcrypt: provides utilities for the encryption of passwords, is vital for services that have user registration steps, it guaranties the safety of passwords and data
* jsonwebtoken: very useful after the autentication, it provides the user a web token (JWT) and subsequent requests by the user will include the assigned JWT. This token tells the server what routes, services, and resources the user is allowed to access
* mongodb: online database used to store data
* mongoose: provides several functions in order to manipulate the documents of the collection of the MongoDB database
* dotenv: great way to keep passwords, API keys, and other sensitive data safe. It allows also to create environment variables in a .env file
* nodemon: provides useful utilities while programming and testing, for each save in the code it refreshes the server
* swagger-ui-express: allows to serve auto-generated swagger-ui generated API docs from express, based on a swagger.json file
* swagger-jsdoc: reads the JSDoc-annotated source code and generates an OpenAPI (Swagger) specification.
* @types/express:
* @types/express-serve-static-core:
* tailwindcss:


# how to run the project:
    $ npm install
creare un file .env con DATABASE_URL = <my_link> per connettersi a mongodb e ACCESS_TOKEN_SECRET = <secret_number>, dove <secret_number> è una stringa di 64 random Bytes in formato hexadecimale. Per farlo si può ricorrere ai seguenti comandi:

    $ node
    > require('crypto').randomBytes(64).toString('hex')
dopodiché

    $ npm run devStart

# documentation here:
    https://localhost:3000/api-docs

# credits
Francesco La Rosa, Unitn
Johnjairo Melendez, Adolfo Ibañez University
Luigi Gammino, Unitn

![UNISURVEY](/Immagini/Logo.jpg)