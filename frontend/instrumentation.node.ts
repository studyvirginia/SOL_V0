import openlit from 'openlit';

/**
 * OpenLIT Instrumentation: Auto-Monitoring for Mistral AI SDK
 * This initializes OpenTelemetry for the Node.js server runtime.
 */
console.log("Initializing OpenLIT Observability Stack...");

openlit.init({
  applicationName: "SOL_Study_Assistant",
  otlpEndpoint: "http://localhost:4318",
});
