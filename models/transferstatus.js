let TransferStatus = {
    StatusInitiated: 'Initiated', // when a transaction is started but not credeited or debited
    StatusSubmittedToPayliance: "SubmittedToPayliance", // when submitted to payliance and waiting approval
    StatusFailed: "Failed",
    StatusSucceded: "Succeded",
    StatusRefunded: "Refunded"
}

export default TransferStatus;