# Development 

## Project Structure
CivicSphere follows a monorepository approach for development with the following components:

- **Frontend**: Built using Next.js for dynamic user experience with i18n and PWA support, located in `frontend/` folder
- **Backend:** RESTful APIs developed with Python and FastAPI with code for Azure Function Apps, located in `backend/` folder
- **Deployment:** Deployment instructions and scripts, located in `deployment/` folder
- **Docs:** Platform documentation, located in `docs/` folder

## Prerequisites
- Docker and Docker Compose for containerized development

## Steps to Run Locally
- Verify Docker and Docker Compose are installed:
```sh
docker -v
docker compose version
```
- Clone the repository and set up environment variables as per the .env.sample for the frontend and backend.
```sh
git clone https://github.com/grittypuffy/civicsphere
cd civicsphere
cp frontend/.env.sample frontend/.env
cp backend/.env.sample backend/.env
```
- Create SSL certificates using mkcert inside project root directory
```sh
mkdir certs
cd certs
mkcert localhost
``` 
- Install all the backend dependencies and activate virtual environment
```sh
cd backend
poetry install
$(poetry env activate)
```
- Install all the frontend dependencies and activate virtual environment
```sh
cd frontend
yarn install
```
- Run the project under the project root folder using `docker compose up --build` to build all the images and start the services