"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Contracts",
      [
        {
          clientId: 1,
          contractorId: 2,
          contractName: "web dedvelopment contract",
          status: "NEW",
        },
        {
          clientId: 3,
          contractorId: 4,
          contractName: "graphic design contract",
          status: "NEW",
        },
        {
          clientId: 3,
          contractorId: 4,
          contractName: "graphic design contract",
          status: "NEW",
        },
        {
          clientId: 1,
          contractorId: 2,
          contractName: "web dedvelopment contract",
          status: "NEW",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Contracts", null, {});
  },
};
