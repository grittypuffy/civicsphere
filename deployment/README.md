# Deployment

While deploying to Azure, we prefer usage of East US and East US 2 to avoid issues with AI Services. It is also recommended to host resources under same location as the resource group to ensure consistency.

We have simplified the process of creating resources using Azure CLI utility.

To get started:

1. Ensure you have Azure CLI installed on your system. You can check it by:
```sh
az --version
```
2. Run `deployment.sh` to set up the required components:
```sh
chmod +x deployment.sh
./deployment.sh
```
3. Run `backend.sh` to set up the backend resources:
```sh
chmod +x backend.sh
./backend.sh
```
Make sure to configure the environment variables accordingly for the backend based on the provisioned resource to ensure the backend works.