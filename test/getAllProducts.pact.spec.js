import {API} from '../src/api'
import {like, regex} from '@pact-foundation/pact/src/dsl/matchers'
import {url, port, pact} from '../test/setupPact'

require('dotenv').config()

describe('Demo test', () => {
    describe('Getting all products test', () => {

        // (2) Start the mock server
        beforeAll(() => pact.setup());

        // (4) write your test(s)
        test('All products exist', async () => {

            // this is the response you expect from your Provider
            const expectedProduct = [{id: '09', name: 'Gem Visa', type: 'CREDIT_CARD', version: 'v1'},
                                    {id: '10', name: '28 Degrees', type: 'CREDIT_CARD', version: 'v1'},
                                    {id: '11', name: 'MyFlexiPay', type: 'PERSONAL_LOAN', version: 'v2'}]

            reporter.startStep("Step 1: Add interaction");
            await pact.addInteraction({
                // The 'state' field specifies a "Provider State"
                state: 'all products exist',
                uponReceiving: 'a request to get all products',
                withRequest: {
                    method: 'GET',
                    path: '/products',
                    headers: {
                        Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': regex({generate: 'application/json; charset=utf-8', matcher: 'application/json;?.*'}),
                    },
                    body: (expectedProduct),
                },
            });
            reporter.endStep();

            reporter.startStep("Step 2: Create a new API");
            const api = new API(`${url + port}`);
            reporter.endStep();

            // make request to Pact mock server
            reporter.startStep("Step 3: Make a request to Pact mock server to get all products");
            const products = await api.getAllProducts();
            reporter.endStep();

            // assert that we got the expected response
            // expect(products).toEqual(expectedProduct);
            reporter.startStep("Step 4: Verify the response is correct")
            expect(products).toEqual(expectedProduct);
            reporter.endStep();
        });

        test('No product exists', async () => {
            reporter.startStep("Step 1: Add interaction");
            await pact.addInteraction({
                state: 'no product exists',
                uponReceiving: 'a request to get all products',
                withRequest: {
                    method: 'GET',
                    path: '/products',
                    headers: {
                        Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': regex({generate: 'application/json; charset=utf-8', matcher: 'application/json;?.*'}),
                    },
                    body: [],
                },
            });
            reporter.endStep();

            reporter.startStep("Step 2: Create a new API");
            const api = new API(`${url + port}`);
            reporter.endStep();

            reporter.startStep("Step 3: Make a request to get all products");
            const products = await api.getAllProducts();
            reporter.endStep();

            reporter.startStep("Step 4: Verify the response is correct");
            expect(products).toEqual([]);
            reporter.endStep();
        });

        test("No auth token", async () => {
            reporter.startStep("Step 1: Add interaction");
            await pact.addInteraction({
                state: 'no auth token when getting all products',
                uponReceiving: 'a request to get all products with no auth token',
                withRequest: {
                    method: 'GET',
                    path: '/products'
                },
                willRespondWith: {
                    status: 401
                },
            });
            reporter.endStep();

            reporter.startStep("Step 2: Create a new API")
            const api = new API(`${url + port}`);
            reporter.endStep();

            reporter.startStep("Step 3: Make a request and verify the response is correct");
            await expect(api.getAllProducts()).rejects.toThrow("Request failed with status code 401");
            reporter.endStep();
        });

        // (5) validate the interactions you've registered and expected occurred
        // this will throw an error if it fails telling you what went wrong
        // This should be performed once per interaction test
        afterEach(() => pact.verify());

        // (6) write the pact file for this consumer-provider pair,
        // and shutdown the associated mock server.
        // You should do this only _once_ per Provider you are testing,
        // and after _all_ tests have run for that suite
        afterAll(() => pact.finalize());
    });
});