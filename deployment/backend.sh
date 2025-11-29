# Login using the CLI, which will open a web browser and then ask for the subscription you want to choose
echo "Please enter your project name:"
read name

az login

az appservice plan create \
  --name "${name}-prod-asp-eus2-001" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --sku F1 \
  --is-linux

az webapp create \
  --name "${name}-api" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --plan "${name}-prod-asp-eus2-001"


az functionapp create \
  --name "${name}-prod-func-eus2-001" \
  --resource-group "${name}-prod-rg-eus2-001" \
  --storage-account "${name}stacc001" \
  --plan "${name}-prod-asp-eus2-001" \
  --runtime python \
  --runtime-version 3.12 \
  --functions-version 4 \
  --tags environment=production
