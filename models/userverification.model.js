const UserVerificationModel = (sequelize, Sequelize) => {
    const Model = sequelize.define("UserVerificationModel", {

        client_user_id: {
            type: Sequelize.STRING(50),
            default: ""
        },
        idv: {
            type: Sequelize.STRING(50),
            default: ""
        },
        document_idv: {
            type: Sequelize.STRING(100),
            default: ''
        },
        completed_at: {
            type: Sequelize.STRING,
            default: ""
        },
        kyc_check_status: {
            type: Sequelize.STRING(100),
            default: ""
        },
        documentary_verification_status: {
            type: Sequelize.STRING(100),
            default: ""
        },
        risk_check_status: {
            type: Sequelize.STRING(100),
            default: ""
        },
        selfie_check_status: {
            type: Sequelize.STRING(100),
            default: ""
        },
        template_used: {
            type: Sequelize.STRING(100),
            default: ""
        },
        face_image: {
            type: Sequelize.STRING(2000),
            default: ""
        },
        original_front: {
            type: Sequelize.STRING(2000),
            default: ""
        },
        original_back: {
            type: Sequelize.STRING(2000),
            default: ""
        },

        city: {
            type: Sequelize.STRING(100),
            default: ""
        },
        postal_code: {
            type: Sequelize.STRING(100),
            default: ""
        },
        country: {
            type: Sequelize.STRING(100),
            default: ""
        },
        region: { // state
            type: Sequelize.STRING(100),
            default: ""
        },
        street: {
            type: Sequelize.STRING(100),
            default: ""
        },
        street2: {
            type: Sequelize.STRING(100),
            default: ""
        },
        dob: {
            type: Sequelize.STRING(100),
            default: ""
        },
        email_address: {
            type: Sequelize.STRING(100),
            default: ""
        },
        ssn_last4: {
            type: Sequelize.STRING(100),
            default: ""
        },
        family_name: {
            type: Sequelize.STRING(100),
            default: ""
        },
        given_name: {
            type: Sequelize.STRING(100),
            default: ""
        },
        phone: {
            type: Sequelize.STRING(100),
            default: ""
        },

    });

    return Model;
};

export default UserVerificationModel;