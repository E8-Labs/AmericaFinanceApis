const UserVerificationModel = (sequelize, Sequelize) => {
    const Model = sequelize.define("UserVerificationModel", {

        client_user_id: {
            type: Sequelize.STRING,
            default: ""
        },
        idv: {
            type: Sequelize.STRING,
            default: ""
        },
        completed_at: {
            type: Sequelize.STRING,
            default: ""
        },
        kyc_check_status: {
            type: Sequelize.STRING,
            default: ""
        },
        documentary_verification_status: {
            type: Sequelize.STRING,
            default: ""
        },
        risk_check_status: {
            type: Sequelize.STRING,
            default: ""
        },
        template_used: {
            type: Sequelize.STRING,
            default: ""
        },
        face_image: {
            type: Sequelize.STRING,
            default: ""
        },
        original_front: {
            type: Sequelize.STRING,
            default: ""
        },
        original_back: {
            type: Sequelize.STRING,
            default: ""
        },

        city: {
            type: Sequelize.STRING,
            default: ""
        },
        postal_code: {
            type: Sequelize.STRING,
            default: ""
        },
        country: {
            type: Sequelize.STRING,
            default: ""
        },
        region: { // state
            type: Sequelize.STRING,
            default: ""
        },
        street: {
            type: Sequelize.STRING,
            default: ""
        },
        street2: {
            type: Sequelize.STRING,
            default: ""
        },
        dob: {
            type: Sequelize.STRING,
            default: ""
        },
        email_address: {
            type: Sequelize.STRING,
            default: ""
        },
        ssn_last4: {
            type: Sequelize.STRING,
            default: ""
        },
        family_name: {
            type: Sequelize.STRING,
            default: ""
        },
        given_name: {
            type: Sequelize.STRING,
            default: ""
        },
        phone: {
            type: Sequelize.STRING,
            default: ""
        },

    });

    return Model;
};

export default UserVerificationModel;