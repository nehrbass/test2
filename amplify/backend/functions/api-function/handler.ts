import * as fs from 'fs';
import * as path from 'path'
import {Amplify} from "aws-amplify";
import type { APIGatewayProxyHandler } from "aws-lambda";

// Define the path to the amplify_outputs.json file
const configPath = path.join(__dirname, '../../../../amplify_outputs.json');
const amplifyConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
Amplify.configure(amplifyConfig);

export const handler: APIGatewayProxyHandler = async (event) => {
    console.log("Raw event body:", event.body);
    console.log("Incoming event:", JSON.stringify(event, null, 2));

    let parsedBody;
    if (event.body) {
        try {
            // Parse the JSON body string into an object
            parsedBody = JSON.parse(event.body);
            console.log("Parsed body:", parsedBody);
        } catch (error) {
            console.error("Failed to parse JSON body:", error);
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                },
                body: JSON.stringify({ message: "Invalid JSON" }),
            };
        }
    } else {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ message: "Missing body in request" }),
        };
    }

    // Validate the required fields in the JSON payload
    const { logdate, site, name, value } = parsedBody;

    if (!logdate || !site || name === undefined || value === undefined) {
        return {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({
                message: "Missing one or more required fields: logdate, site, name, value",
            }),
        };
    }

    // Attempt to save the Metric data
    try {
        // await client.models.METRIC.create({
        //   logdate, // Date of the log
        //   site,    // Site name
        //   name,    // Metric name as a number (float)
        //   value,   // Metric value
        // });
        console.log("Metric data saved successfully");
    } catch (error) {
        console.error("Failed to save Metric data:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify({ message: "Failed to save metric data" }),
        };
    }

    // Respond back to the client
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        },
        body: JSON.stringify({
            message: "Metric saved successfully",
            data: { logdate, site, name, value },
        }),
    };
};