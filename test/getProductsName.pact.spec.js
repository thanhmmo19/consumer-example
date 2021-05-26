import {API} from '../src/api'
import {like, regex} from "@pact-foundation/pact/src/dsl/matchers";
import {url, port, pact} from '../test/setupPact'
require('dotenv').config()

describe('Demo test', () => {
    describe('Getting all products name', () => {

        // (2) Start the mock server
        beforeAll(() => pact.setup());

        // (4) write your test(s)
        test('Products name exist', async () => {

            // this is the response you expect from your Provider
            const expectedProductsName = [{name: 'Gem Visa'}, {name: '28 Degrees'}, {name: 'MyFlexiPay'}]

            reporter.startStep("Step 1: Add interaction");
            await pact.addInteraction({
                // The 'state' field specifies a "Provider State"
                state: 'products name exist',
                uponReceiving: 'a request to get all products name',
                withRequest: {
                    method: 'GET',
                    path: '/products/name',
                    headers: {
                        Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
                    },
                },
                willRespondWith: {
                    status: 200,
                    headers: {
                        'Content-Type': regex({generate: 'application/json; charset=utf-8', matcher: 'application/json;?.*'}),
                    },
                    body: (expectedProductsName),
                },
            });
            reporter.endStep();

            reporter.startStep("Step 2: Create a new API");
            const api = new API(`${url + port}`);
            reporter.endStep();

            // make request to Pact mock server
            reporter.startStep("Step 3: Make a request to get all products name");
            const productsName = await api.getProductsName();
            reporter.endStep();

            // assert that we got the expected response
            reporter.startStep("Step 4: Verify the response is correct");
            expect(productsName).toEqual(expectedProductsName);
            reporter.endStep();
        });

        test('No product name exists', async () => {
            reporter.startStep("Step 1: Add interaction");
            await pact.addInteraction({
                state: 'no product name exists',
                uponReceiving: 'a request to get products name',
                withRequest: {
                    method: 'GET',
                    path: '/products/name',
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

            reporter.startStep("Step 3: Make a request to get all products name");
            const productsName = await api.getProductsName();
            reporter.endStep();

            reporter.startStep("Step 4: Verify the response is correct");
            expect(productsName).toEqual([]);
            reporter.endStep();
        });

        test("No auth token", async () => {
            reporter.startStep("Step 1: Add interaction");
            await pact.addInteraction({
                state: 'no auth token when getting product name',
                uponReceiving: 'a request to get product name with no auth token',
                withRequest: {
                    method: 'GET',
                    path: '/products/name'
                },
                willRespondWith: {
                    status: 401
                },
            });
            reporter.endStep();

            reporter.startStep("Step 2: Create a new API");
            const api = new API(`${url + port}`);
            reporter.endStep();

            reporter.startStep("Step 3: Make a request and verify the response is correct");
            await expect(api.getProductsName()).rejects.toThrow("Request failed with status code 401");
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