const core = require('@actions/core');
const fs = require('fs');
const AWS = require('aws-sdk');

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

        // Initialize AWS SSM
        const ssm = new AWS.SSM();

        // Store in SSM
        const params = {
            Name: ssmPath,
            Value: fileContent,
            Type: 'String',  // Or 'SecureString' if it's sensitive data
            Overwrite: true
        };

        await ssm.putParameter(params).promise();

        console.log(`File content stored in SSM at path: ${ssmPath}`);
    } catch (error) {
        core.setFailed(`Action failed with error: ${error}`);
    }
}

run();
