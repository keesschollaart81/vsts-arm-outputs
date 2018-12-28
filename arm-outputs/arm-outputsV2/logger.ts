import * as appInsights from 'applicationinsights';
import * as tl from 'azure-pipelines-task-lib/task';

if (!tl.getVariable("arm-outputs-notelemetry")) {
    appInsights.setup("d90eab13-5c01-4e27-bbf9-376cf28bf5cf")
        .setAutoDependencyCorrelation(false)
        .setAutoCollectRequests(false)
        .setAutoCollectPerformance(false)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(false)
        .setAutoCollectConsole(false)
        .setUseDiskRetryCaching(false);

    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.applicationVersion] = "5.0.0";
    appInsights.start();
}
let appInsightsClient = appInsights.defaultClient;

export default appInsightsClient