"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Profiles",
      [
        {
          name: "John Doe",
          balance: 0.0,
          type: "CLIENT",
          profession: null,
        },
        {
          name: "Jane Smith",
          balance: 0.0,
          type: "CONTRACTOR",
          profession: "Web Developer",
        },
        {
          name: "Mark Johnson",
          balance: 0.0,
          type: "CLIENT",
          profession: null,
        },
        {
          name: "Emily Davis",
          balance: 0.0,
          type: "CONTRACTOR",
          profession: "Graphic Designer",
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Profiles", null, {});
  },
};
