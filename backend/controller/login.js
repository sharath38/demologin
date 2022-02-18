
const asyncHandler = require('../middleWare/async');
const axios = require('axios');
const dotenv = require('dotenv');
const querystring = require('querystring');
const { URLSearchParams } = require('url');

dotenv.config();

const cqubeAuth = process.env.cqube_auth;
const keyCloakURL = process.env.KEYCLOAK_HOST
const keyClockRealm = process.env.KEYCLOAK_REALM

const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    let role

    let stateheaders = {
        "Content-Type": "application/json",
    }


    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password', 400));
    }


    try {
       
        let keycloakUrl = `${keyCloakURL}/auth/realms/${keyClockRealm}/protocol/openid-connect/token`;
        let keycloakheaders = {
            "Content-Type": "application/x-www-form-urlencoded",
        }

        let keyCloakdetails = new URLSearchParams({
            client_id: 'clientid3',
            grant_type: 'password',
            username: req.body.email,
            password: req.body.password
        });
        await axios.post(keycloakUrl, keyCloakdetails, { headers: keycloakheaders }).then(resp => {

            let response = resp['data']
            // console.log('resp', resp)
            let jwt = resp['data'].access_token
            let noUserInkeycloak = false

            if (resp.status === 200) {
                const decodingJWT = (token) => {
                    if (token !== null || token !== undefined) {
                        const base64String = token.split('.')[1];
                        const decodedValue = JSON.parse(Buffer.from(base64String,
                            'base64').toString('ascii'));
                        console.log(decodedValue.realm_access.roles[0]);
                        role = decodedValue.realm_access.roles[0]
                        return decodedValue;
                    }
                    return null;
                }
                decodingJWT(jwt)
            };

            if (role === 'admin' || (role === 'report_viewer' && cqubeAuth == 'cQube')) {
                res.send({ token: jwt, role: role, res: response })
            }

            if (role == 'report_viewer') {
                if (cqubeAuth === 'state') {
                    console.log('state && reportViewer')
                    let url = 'http://0.0.0.0:6001/login';
                    let headers = {
                        "Content-Type": "application/json",
                    }

                    let details = {
                        username: email,
                        password: password
                    };

                    axios.post(url, details, { headers: headers }).then(resp => {

                        let token = resp.data.access_token
                        
                        res.send({ token: token })
                    }).catch(error => {

                        console.log('notconnected')
                        console.log(error)
                        res.status(409).json({ errMsg: error.response.data.errorMessage });
                    })
                } else if (cqubeAuth === 'cQube') {
                    console.log('authtype--cQube')
                    res.send({ token: jwt, role: role, res: response })
                }
            } else if (role === 'admin') {
                res.send({ token: jwt, role: role, res: response })
            } else if (role === 'emission') {
                res.status(401).json({
                    errMessage: "Not authoruzer to view the reports!!"
                });
            } else {
                console.log('lastelse')
                let url = 'http://0.0.0.0:6001/login';
                let headers = {
                    "Content-Type": "application/json",
                }

                let details = {
                    username: email,
                    password: password
                };

                axios.post(url, details, { headers: headers }).then(resp => {

                    let token = resp.data.access_token
                    res.send({ token: token })
                }).catch(error => {

                    console.log('notconnected')
                    console.log(error)
                    res.status(409).json({ errMsg: error.response.errorMessage });
                })
            }

        }

        ).catch(error => {
            // logger.error(`Error :: ${error}`)

            console.log(error)


            let url = 'http://0.0.0.0:6001/login';
            // let headers = {
            //     "Content-Type": "application/json",
            // }

            let details = {
                username: email,
                password: password
            };

            axios.post(url, details, { headers: stateheaders }).then(resp => {

                let token = resp.data.access_token
                res.send({ token: token })
            }).catch(error => {

                console.log('notconnected')
                console.log(error)
                res.status(409).json({ errMsg: error.data.response.errorMessage });
            })
        })


    } catch (error) {
        console.log('err', error)
    }
});



module.exports = login