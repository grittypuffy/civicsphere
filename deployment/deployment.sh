# Login using the CLI, which will open a web browser and then ask for the subscription you want to choose
echo "Please enter your project name:"
read name

#az login

echo "Please enter your subscription ID:"
read sub


# Create a resource group
az group create --name "${name}-prod-rg-eus2-001" --location eastus2

# Create a service principal for usage with Github actions. --sdk-auth is deprecated
az ad sp create-for-rbac --name "ga-${name}-deployment" --role contributor --scopes "/subscriptions/${sub}/resourceGroups/${name}-prod-rg-eus2-001" --sdk-auth

# Add ML extension for AI foundry related actions via CLI
az extension add --name ml

# Create an Azure AI Foundry Hub
az ml workspace create --kind hub \
  --name "${name}-prod-aih-eus2-001" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --location eastus2 \
  --tags environment=production

# Create a Foundry project
az ml workspace create --kind project \
  --name "${name}-prod-aip-eus2-001" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --hub-id "/subscriptions/${sub}/resourceGroups/${name}-prod-rg-eus2-001/providers/Microsoft.MachineLearningServices/workspaces/${name}-prod-aih-eus2-001" \
  --tags environment=production

# Create Azure AI Search resource
az search service create \
  --name "${name}-prod-ais-eus2-001" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --location eastus2 \
  --sku free \
  --tags environment=production


# Create a storage account

az storage account create \
  --name "${name}stacc001" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --location eastus2 \
  --sku Standard_LRS \
  --kind StorageV2 \
  --tags environment=production


# Create CosmosDB
az provider register --namespace Microsoft.DocumentDB

az cosmosdb create \
  --name $name \
  --resource-group "${name}-prod-rg-eus2-001" \
  --kind MongoDB \
  --locations regionName=eastus2 failoverPriority=0 isZoneRedundant=false \
  --default-consistency-level Session \
  --tags environment=production


# Create a storage container
az storage account create \
  --name "${name}stacc001" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --location eastus2 \
  --sku Standard_LRS \
  --tags environment=production


# Get resource key
az storage account keys list \
   --resource-group "${name}-prod-rg-eus2-001" \
   --account-name "${name}stacc001" \
   --query "[0].value" -o tsv

# Create container
az storage container create \
 --name  knowledgebase \
 --account-name "${name}stacc001" \
 --account-key  "AccountKey" \
 --public-access container

# ACR
az acr create --resource-group "${name}-prod-rg-eus2-001" --name $name --sku Basic