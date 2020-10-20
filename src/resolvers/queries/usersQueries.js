const usersQueries = {
  // get all usernames (but not participants)
  async allUsernames(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    const users = await ctx.db.query.profiles({}, info);
    const notParticipants = users.filter(
      user =>
        user.permissions.includes('TEACHER') ||
        user.permissions.includes('STUDENT') ||
        user.permissions.includes('SCIENTIST')
    );
    return notParticipants;
  },
  // study participants
  async myStudyParticipants(parent, args, ctx, info) {
    // 1. check if the user has permission to see the study (Scientist of this study) or Admin
    const { where } = args;
    const mystudy = await ctx.db.query.study(
      { where },
      `{ id title author {id} collaborators {id}}`
    );
    const ownsStudy = mystudy.author.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN'].includes(permission)
    );
    let collaboratorInStudy;
    if (mystudy.collaborators) {
      const collaboratorsIds = mystudy.collaborators.map(
        collaborator => collaborator.id
      );
      collaboratorInStudy = collaboratorsIds.includes(ctx.request.userId);
    }

    if (!ownsStudy && !hasPermissions && !collaboratorInStudy) {
      throw new Error(`You don't have permission to do that!`);
    }

    return ctx.db.query.study({ where }, info);

    // 2. query all results of the study
    // return ctx.db.query.results(
    //   {
    //     where: {
    //       study: {
    //         id: mystudy.id,
    //       },
    //     },
    //   },
    //   info
    // );
  },
};

module.exports = usersQueries;
