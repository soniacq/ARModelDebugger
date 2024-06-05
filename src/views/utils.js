import { get_allTimestamps, process_timestamps } from "./config";

export function consolidate_data(files){
    let dataFiles = files;
    // TIMESTAMP
    process_timestamps(dataFiles);
    let allTimestamps = get_allTimestamps();

    dataFiles[0].forEach((trial)=>{
        //consolidate step data:
        let consolidatedStepData = {
            step: [],
            flightPhase: [],
            error: [],
            prediction: [],
            confidence: []
        };  
        let currentStep = null;
        let currentError = null;
        let currentPrediction= null;
        

        trial['data'].forEach(record => {

            if (record.seconds<0){
                return
            }

            // Consolidate 'Step' data
            if (record.Step !== currentStep) {
                if (consolidatedStepData.step.length > 0) {
                consolidatedStepData.step[consolidatedStepData.step.length - 1].endTimestamp = record.seconds;
                }
                consolidatedStepData.step.push({
                startTimestamp: record.seconds,
                endTimestamp: record.seconds,
                value: record.Step
                });
                currentStep = record.Step;
            } else {
                consolidatedStepData.step[consolidatedStepData.step.length - 1].endTimestamp = record.seconds;
            }

            // Consolidate 'Error' data
            if (record.Error !== currentError) {
                if (consolidatedStepData.error.length > 0) {
                consolidatedStepData.error[consolidatedStepData.error.length - 1].endTimestamp = record.seconds;
                }
                consolidatedStepData.error.push({
                startTimestamp: record.seconds,
                endTimestamp: record.seconds,
                value: record.Error
                });
                currentError = record.Error;
            } else {
                consolidatedStepData.error[consolidatedStepData.error.length - 1].endTimestamp = record.seconds;
            }

            // Consolidate 'Prediction' data
            if (record.Prediction !== currentPrediction) {
                if (consolidatedStepData.prediction.length > 0) {
                consolidatedStepData.prediction[consolidatedStepData.prediction.length - 1].endTimestamp = record.seconds;
                }
                consolidatedStepData.prediction.push({
                startTimestamp: record.seconds,
                endTimestamp: record.seconds,
                value: record.Prediction
                });
                currentPrediction = record.Prediction;
            } else {
                consolidatedStepData.prediction[consolidatedStepData.prediction.length - 1].endTimestamp = record.seconds;
            }
        });
        trial['consolidatedStepData'] = consolidatedStepData;
    })

    return dataFiles;
}
