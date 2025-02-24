import * as fs from 'fs';
import * as path from 'path';
import { Amplify } from 'aws-amplify';

// Define the path to the amplify_outputs.json file relative to the config.ts file
const configPath1 = path.join(__dirname, '../amplify_outputs.json');
const configPath2 = path.join(__dirname, 'amplify_outputs.json');

// Load the configuration dynamically

let amplifyConfig;

if (fs.existsSync(configPath1)) {
    amplifyConfig = JSON.parse(fs.readFileSync(configPath1, 'utf-8'));
    Amplify.configure(amplifyConfig);
} else if (fs.existsSync(configPath2)) {
    amplifyConfig = JSON.parse(fs.readFileSync(configPath2, 'utf-8'));
    Amplify.configure(amplifyConfig);
}else {
    console.error('Amplify configuration file not found:');
    // Handle missing configuration case
}

export default amplifyConfig;