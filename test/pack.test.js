const path = require('path');
const { describe, expect, test } = require('@jest/globals');

const { executePythonScript } = require('../src/utils/pythonExecutor');

const EJECUTABLE = path.join(__dirname, '..', 'src', 'utils', 'ejecutable.py');



describe('executePythonScript', () => {

  // Agregar más pruebas para otras funciones del controlador
   test('Debería devolver un JSON con la info de una baulera y una lista de items posicionados', async () => {
        
        const req_json = {
          baulera: {
            name: 'baulera simple 3x3x3',
            width: 3.0,
            height: 3.0,
            depth: 3.0,
            weightLimit: 10000,
          },
          items: [
            {
              name: 'sillon 2 cuerpos',
              width: 3.0,
              height: 0.8,
              depth: 0.8,
              weight: 40,
              quantity: 1,
            },
            {
              name: 'mesa de luz',
              width: 0.4,
              height: 0.5,
              depth: 0.4,
              weight: 5,
              quantity: 1,
            },
          ],
        };
        const req = JSON.stringify(req_json);

        const res_received_json = await executePythonScript(EJECUTABLE, req);
        const res = JSON.parse(res_received_json);

        expect(res).toHaveProperty('baulera');
        expect(res.baulera.detail).toMatch(/baulera simple 3x3x3/);
        expect(res).toHaveProperty('fittedItems');
        expect(res.fittedItems).toHaveLength(2);
        expect(res.unfittedItems).toHaveLength(0);

        for (const f of res.fittedItems) {
          expect(f).toHaveProperty('name');
          expect(f).toHaveProperty('position');
          expect(f.position).toMatchObject({ x: expect.any(Number), y: expect.any(Number), z: expect.any(Number) });
          expect(f).toHaveProperty('rotationType', expect.any(Number));
          expect(f).toHaveProperty('rotationLabel', expect.any(String));
          expect(f).toHaveProperty('dimensions');
          expect(f.dimensions).toMatchObject({
            width: expect.any(Number),
            height: expect.any(Number),
            depth: expect.any(Number),
          });
          expect(f).toHaveProperty('weight', expect.any(Number));
          expect(f).toHaveProperty('volume', expect.any(Number));
          expect(f).toHaveProperty('detail');
          expect(typeof f.detail).toBe('string');
        }

        const names = res.fittedItems.map((f) => f.name).join(' ');
        expect(names).toMatch(/mesa de luz/);
        expect(names).toMatch(/sillon 2 cuerpos/);

    });



});
