'use strict';

module.exports = function (app) {

  let issues = {};  // 用來暫存所有專案的問題資料

  app.route('/api/issues/:project')
  
    // GET request to retrieve issues
    .get(function (req, res){
      let project = req.params.project;
      let projectIssues = issues[project] || [];  // 取出對應專案的問題列表
      
      // 根據查詢參數過濾問題
      let filteredIssues = projectIssues.filter(issue => {
        for (let key in req.query) {
          if (issue[key] != req.query[key]) {
            return false;
          }
        }
        return true;
      });

      res.json(filteredIssues);
    })
    
    // POST request to create an issue
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to = '', status_text = '' } = req.body;

      // 檢查必要的欄位
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      // 創建新問題物件
      let newIssue = {
        _id: Math.random().toString(36).substr(2, 9),  // 簡單生成隨機的 _id
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        open: true,
      };

      // 將新問題加入對應專案
      if (!issues[project]) {
        issues[project] = [];
      }
      issues[project].push(newIssue);

      res.json(newIssue);
    })
    
    // PUT request to update an issue
    .put(function (req, res){
      let project = req.params.project;
      const { _id, ...fieldsToUpdate } = req.body;

      // 檢查是否提供了 _id
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      // 檢查是否有更新欄位
      if (Object.keys(fieldsToUpdate).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      let projectIssues = issues[project] || [];
      let issue = projectIssues.find(i => i._id === _id);

      if (!issue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      // 更新問題的欄位和 updated_on
      Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key] !== undefined) {
          issue[key] = fieldsToUpdate[key];
        }
      });
      issue.updated_on = new Date().toISOString();

      res.json({ result: 'successfully updated', '_id': _id });
    })
    
    // DELETE request to delete an issue
    .delete(function (req, res){
      let project = req.params.project;
      const { _id } = req.body;

      // 檢查是否提供了 _id
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      let projectIssues = issues[project] || [];
      let issueIndex = projectIssues.findIndex(i => i._id === _id);

      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      // 刪除問題
      projectIssues.splice(issueIndex, 1);

      res.json({ result: 'successfully deleted', '_id': _id });
    });
};
