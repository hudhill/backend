const authMutations = require('./mutations/authMutations');
const resultsMutations = require('./mutations/resultsMutations');
const classMutations = require('./mutations/classMutations');
const parameterMutations = require('./mutations/parameterMutations');
const participantsMutations = require('./mutations/participantsMutations');
const templateMutations = require('./mutations/templateMutations');
const taskMutations = require('./mutations/taskMutations');
const studyMutations = require('./mutations/studyMutations');

const Mutations = {
  ...authMutations,
  ...resultsMutations,
  ...classMutations,
  ...parameterMutations,
  ...participantsMutations,
  ...templateMutations,
  ...taskMutations,
  ...studyMutations,

  async createSchool(parent, args, ctx, info) {
    // TODO: Check login
    console.log('args', args);

    const school = await ctx.db.mutation.createSchool(
      {
        data: {
          ...args,
        },
      },
      info
    );

    return school;
  },

  async createExperiment(parent, args, ctx, info) {
    // Check login
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }

    const experiment = await ctx.db.mutation.createExperiment(
      {
        data: {
          // this is to create a relationship between the experiment and the author
          author: {
            connect: {
              id: ctx.request.userId,
            },
          },
          ...args,
        },
      },
      info
    );
    return experiment;
  },

  // update the experiment
  updateExperiment(parent, args, ctx, info) {
    // take a copy of updates
    const updates = { ...args };
    // remove the ID from the updates
    delete updates.id;
    // run the update method
    return ctx.db.mutation.updateExperiment(
      {
        data: updates,
        where: {
          id: args.id,
        },
      },
      info
    );
  },

  // delete experiment
  async deleteExperiment(parent, args, ctx, info) {
    const where = { id: args.id };
    // find experiment
    const experiment = await ctx.db.query.experiment(
      { where },
      `{ id title author {id} }`
    );
    // check whether user has permissions to delete the item
    // TODO
    const ownsExperiment = experiment.author.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN'].includes(permission)
    );
    if (!ownsExperiment && !hasPermissions) {
      throw new Error(`You don't have permission to do that!`);
    }

    // delete it
    return ctx.db.mutation.deleteExperiment({ where }, info);
  },
};

module.exports = Mutations;
