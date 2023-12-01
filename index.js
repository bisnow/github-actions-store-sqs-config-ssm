const core = require('@actions/core');
const fs = require('fs');
const { SSMClient, PutParameterCommand, GetParameterCommand } = require("@aws-sdk/client-ssm");

async function run() {
    try {
        // Get inputs
        const filePath = core.getInput('file-path', { required: true });
        const base64 = core.getInput('base64', { required: true }) === 'true';
        const ssmPath = core.getInput('ssm-path', { required: true });

        // Read file content
        let fileContent = fs.readFileSync(filePath, 'utf-8');

        // Base64 encode if necessary
        if (base64) {
            fileContent = Buffer.from(fileContent).toString('base64');
        }

        // Initialize AWS SSM Client
        const ssmClient = new SSMClient({});

        // Function to create or update the parameter
        async function putParameter() {
            const params = {
                Name: ssmPath,
                Value: fileContent,
                Type: 'String',  // Or 'SecureString' if it's sensitive data
                Overwrite: true
            };

            const putParameterCommand = new PutParameterCommand(params);
            await ssmClient.send(putParameterCommand);
            console.log(`Parameter stored at path: ${ssmPath}`);
        }

        // Attempt to get the current value from SSM
        try {
            const getParameterCommand = new GetParameterCommand({
                Name: ssmPath,
                WithDecryption: true
            });

            const currentParam = await ssmClient.send(getParameterCommand);

            // Compare and update only if different
            if (currentParam.Parameter.Value !== fileContent) {
                await putParameter();
            } else {
                console.log(`No update required. SSM Parameter at path ${ssmPath} is up-to-date.`);
            }
        } catch (error) {
            if (error.name === 'ParameterNotFound') {
                // Parameter not found, create a new one
                console.log(`Parameter not found at path: ${ssmPath}. Creating a new parameter.`);
                await putParameter();
            } else {
                // Some other error occurred
                core.setFailed(`Action failed with error: ${error}`);
            }
        }

    } catch (error) {
        core.setFailed(`Action failed with error: ${error}`);
    }
}

run();
