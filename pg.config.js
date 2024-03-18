module.exports = {
  transformers: {
    action: (act) => {
      // console.log('EN EL ACTION TRANSFORMS: ', act)
      return act.toUpperCase();
    },
    subject: (sub) => {
      // console.log('EN EL SUBJECT TRANSFORMS: ', sub)
      return sub.toUpperCase();
    }
  },
  replacements: {
    'x-hasura-user-id': '${user.id}',
    'x-hasura-default-role': '${user.default_user_role}',
    'x-hasura-role': '${user.user_role}',
  }
}