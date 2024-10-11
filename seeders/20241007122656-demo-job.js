"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Jobs",
      [
        {
          contractId: 1,
          jobDescription: "Build an E-commerce website",
          jobPrice: 5000,
          paid: false,
          paymentDate: new Date(),
        },
        {
          contractId: 2,
          jobDescription: "Design an E-commerce website",
          jobPrice: 3000,
          paid: false,
          paymentDate: new Date(),
        },
        {
          contractId: 3,
          jobDescription: "Design a dropshipping website",
          jobPrice: 4000,
          paid: false,
          paymentDate: new Date(),
        },
        {
          contractId: 4,
          jobDescription: "Build a dropshipping website",
          jobPrice: 6000,
          paid: false,
          paymentDate: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Jobs", null, {});
  },
};
