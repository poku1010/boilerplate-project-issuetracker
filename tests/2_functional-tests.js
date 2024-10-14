const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  let testId;  // 儲存用來測試的 issue ID

  // 測試：創建一個含有所有欄位的問題
  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'This is a test issue.',
        created_by: 'Tester',
        assigned_to: 'Dev',
        status_text: 'In Progress'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Issue');
        assert.equal(res.body.issue_text, 'This is a test issue.');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, 'Dev');
        assert.equal(res.body.status_text, 'In Progress');
        assert.property(res.body, '_id');
        testId = res.body._id;  // 儲存 _id 用於後續測試
        done();
      });
  });

  // 測試：只提供必要欄位創建問題
  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Required Fields Issue',
        issue_text: 'This issue has only required fields.',
        created_by: 'Tester'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Required Fields Issue');
        assert.equal(res.body.issue_text, 'This issue has only required fields.');
        assert.equal(res.body.created_by, 'Tester');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.property(res.body, '_id');
        done();
      });
  });

  // 測試：缺少必要欄位創建問題
  test('Create an issue with missing required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_text: 'Missing title and created_by fields.'
      })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // 測試：查看某專案的所有問題
  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // 測試：使用單一篩選條件查看問題
  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // 測試：使用多個篩選條件查看問題
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .query({ open: true, created_by: 'Tester' })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.open, true);
          assert.equal(issue.created_by, 'Tester');
        });
        done();
      });
  });

  // 測試：更新單一欄位
  test('Update one field on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_title: 'Updated Title' })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // 測試：更新多個欄位
  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId, issue_title: 'Updated Title', issue_text: 'Updated text.' })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully updated');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // 測試：更新時缺少 _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ issue_title: 'No ID' })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // 測試：更新時沒有更新欄位
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'no update field(s) sent');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // 測試：更新時使用無效的 _id
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({ _id: 'invalidid', issue_title: 'Invalid ID' })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  // 測試：刪除問題
  test('Delete an issue', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: testId })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.result, 'successfully deleted');
        assert.equal(res.body._id, testId);
        done();
      });
  });

  // 測試：刪除時使用無效的 _id
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({ _id: 'invalidid' })
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  // 測試：刪除時缺少 _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });
});
