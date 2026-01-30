const AuditLog = require("../models/AuditLog");

exports.logAction = async (user,role,action,caseId=null)=>{
  await AuditLog.create({user,role,action,caseId});
};
