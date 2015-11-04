/*jshint expr: true*/

import { expect } from 'chai';

export default function(people, _ids, errors, idProp = 'id') {
  describe('get', () => {
    it('returns an instance that exists', done => {
      people.get(_ids.Doug, {}, (error, data) => {
        expect(!error).to.be.ok;
        expect(data[idProp]).to.equal(_ids.Doug);
        expect(data.name).to.equal('Doug');
        done();
      });
    });

    it('returns an error when no id is provided', done => {
      people.get((error, data) => {
        expect(error).to.be.ok;
        expect(error instanceof errors.BadRequest).to.be.ok;
        expect(data).to.be.undefined;
        done();
      });
    });

    it('returns NotFound error for non-existing id', done => {
      people.get('abc', {}, (error, data) => {
        expect(error).to.be.ok;
        expect(error instanceof errors.NotFound).to.be.ok;
        expect(error.message).to.equal('No record found for id \'abc\'');
        expect(data).to.be.undefined;
        done();
      });
    });
  });

  describe('remove', () => {
    it('deletes an existing instance and returns the deleted instance', done => {
      people.remove(_ids.Doug, {}, function(error, data) {
        expect(!error).to.be.ok;
        expect(data).to.be.ok;
        expect(data.name).to.equal('Doug');
        done();
      });
    });
  });

  describe('find', () => {
    beforeEach(done => {
      people.create({
        name: 'Bob',
        age: 25
      }, {}, (err, bob) => {
        _ids.Bob = bob[idProp];

        people.create({
          name: 'Alice',
          age: 19
        }, {}, (err, alice) => {
          _ids.Alice = alice[idProp];

          done();
        });
      });
    });

    afterEach(done => {
      people.remove(_ids.Bob, {}, () => {
        people.remove(_ids.Alice, {}, () => {
          done();
        });
      });
    });

    it('returns all items', done => {
      people.find({}, (error, data) => {
        expect(!error).to.be.ok;
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.equal(3);
        done();
      });
    });

    it('filters results by a single parameter', done => {
      var params = { query: { name: 'Alice' } };

      people.find(params, (error, data) => {
        expect(!error).to.be.ok;
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.equal(1);
        expect(data[0].name).to.equal('Alice');
        done();
      });
    });

    it('filters results by multiple parameters', done => {
      var params = { query: { name: 'Alice', age: 19 } };

      people.find(params, (error, data) => {
        expect(!error).to.be.ok;
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.equal(1);
        expect(data[0].name).to.equal('Alice');
        done();
      });
    });

    describe('special filters', ()  => {
      it('can $sort', done => {
        var params = {
          query: {
            $sort: {name: 1}
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data.length).to.equal(3);
          expect(data[0].name).to.equal('Alice');
          expect(data[1].name).to.equal('Bob');
          expect(data[2].name).to.equal('Doug');
          done();
        });
      });

      it('can $limit', done => {
        var params = {
          query: {
            $limit: 2
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data.length).to.equal(2);
          done();
        });
      });

      it('can $skip', done => {
        var params = {
          query: {
            $sort: {name: 1},
            $skip: 1
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data.length).to.equal(2);
          expect(data[0].name).to.equal('Bob');
          expect(data[1].name).to.equal('Doug');
          done();
        });
      });

      it('can $select', done => {
        var params = {
          query: {
            name: 'Alice',
            $select: ['name']
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data.length).to.equal(1);
          expect(data[0].name).to.equal('Alice');
          expect(data[0].age).to.be.undefined;
          done();
        });
      });

      it('can $or', done => {
        var params = {
          query: {
            $or: [
              { name: 'Alice' },
              { name: 'Bob' }
            ],
            $sort: {name: 1}
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(2);
          expect(data[0].name).to.equal('Alice');
          expect(data[1].name).to.equal('Bob');
          done();
        });
      });

      it('can $in', done => {
        var params = {
          query: {
            name: {
              $in: ['Alice', 'Bob']
            },
            $sort: {name: 1}
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(2);
          expect(data[0].name).to.equal('Alice');
          expect(data[1].name).to.equal('Bob');
          done();
        });
      });

      it('can $nin', done => {
        var params = {
          query: {
            name: {
              $nin: ['Alice', 'Bob']
            }
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(1);
          expect(data[0].name).to.equal('Doug');
          done();
        });
      });

      it('can $lt', done => {
        var params = {
          query: {
            age: {
              $lt: 30
            }
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(2);
          done();
        });
      });

      it('can $lte', done => {
        var params = {
          query: {
            age: {
              $lte: 25
            }
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(2);
          done();
        });
      });

      it('can $gt', done => {
        var params = {
          query: {
            age: {
              $gt: 30
            }
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(1);
          done();
        });
      });

      it('can $gte', done => {
        var params = {
          query: {
            age: {
              $gte: 25
            }
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(2);
          done();
        });
      });

      it('can $not', done => {
        var params = {
          query: {
            $not: {
              age: 25
            }
          }
        };

        people.find(params, (error, data) => {
          expect(!error).to.be.ok;
          expect(data).to.be.instanceof(Array);
          expect(data.length).to.equal(2);
          done();
        });
      });

      it.skip('can $populate', done => {
        // expect(service).to.throw('No table name specified.');
        done();
      });
    });

    it.skip('can handle complex nested special queries', done => {
      var params = {
        query: {
          $or: [
            {
              name: 'Doug'
            },
            {
              age: {
                $gte: 18,
                $not: 25
              }
            }
          ]
        }
      };

      people.find(params, (error, data) => {
        expect(!error).to.be.ok;
        expect(data).to.be.instanceof(Array);
        expect(data.length).to.equal(2);
        done();
      });
    });

  });

  describe('update', () => {
    it('replaces an existing instance', done => {
      people.update(_ids.Doug, { name: 'Dougler' }, {}, (error, data) => {
        expect(!error).to.be.ok;
        expect(data[idProp]).to.equal(_ids.Doug);
        expect(data.name).to.equal('Dougler');
        expect(!data.age).to.be.ok;
        done();
      });
    });

    it('returns NotFound error for non-existing id', done => {
      people.update('abc', { name: 'NotFound' }, {}, (error, data) => {
        expect(error).to.be.ok;
        expect(error instanceof errors.NotFound).to.be.ok;
        expect(error.message).to.equal('No record found for id \'abc\'');
        expect(data).to.be.undefined;
        done();
      });
    });
  });

  describe('patch', () => {
    it('updates an existing instance', done => {
      people.patch(_ids.Doug, { name: 'PatchDoug' }, {}, (error, data) => {
        expect(!error).to.be.ok;
        expect(data[idProp]).to.equal(_ids.Doug);
        expect(data.name).to.equal('PatchDoug');
        expect(data.age).to.equal(32);
        done();
      });
    });

    it('returns NotFound error for non-existing id', done => {
      people.patch('abc', { name: 'PatchDoug' }, {}, (error, data) => {
        expect(error).to.be.ok;
        expect(error instanceof errors.NotFound).to.be.ok;
        expect(error.message).to.equal('No record found for id \'abc\'');
        expect(data).to.be.undefined;
        done();
      });
    });
  });

  describe('create', () => {
    it('creates a single new instance and returns the created instance', done => {
      people.create({
        name: 'Bill',
        age: 40
      }, {}, (error, data) => {
        expect(!error).to.be.ok;
        expect(data).to.be.instanceof(Object);
        expect(data).to.not.be.empty;
        expect(data.name).to.equal('Bill');
        done();
      });
    });

    it('creates multiple new instances', done => {
      let items = [
        {
          name: 'Gerald',
          age: 18
        },
        {
          name: 'Herald',
          age: 18
        }
      ];

      people.create(items, {}, (error, data) => {
        expect(!error).to.be.ok;
        expect(data).to.not.be.empty;
        done();
      });
    });
  });
}
