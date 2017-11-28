
var rp = require('request-promise').defaults({ simple: false })
var cheerio = require('cheerio')
// var conn = require('./../libs/connectdb.js')()

// Array contendo as letras que serão usadas no filtro
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

var getInvestors = function(){

    // conn.query("DELETE FROM tbl_organizations WHERE source = 'crunchbase'")
    // conn.query("DELETE FROM tbl_preferred_sectors WHERE source = 'startse'")

    var cookies = []

    var login = 'jairohighwind@hotmail.com'
    var password = 'wizard10'

    return new Promise(function(resolve, reject){

        validateSession(login, password, function(config){

            var organizacoes = []

            getListOrganizations(config, organizacoes, 0, 0, 0, function(result){

                console.log('Lista de Organizacoes/Instituicoes recuperada com sucesso')

            })

        })

    })



}


// Valida sessão no site da CrunchBase

var validateSession = function(login, password, callback){

    // Efetua o login na CrunchBase

    var url = 'https://www.crunchbase.com/v4/cb/sessions'

    var requestOptions = {
        method: 'POST',
        uri : url,
        resolveWithFullResponse: true,
        json: true,
        gzip: true,
        body : {
            'email': login,
            'password': password
        },
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            'Origin': 'https://www.crunchbase.com',
            'Referer': 'https://www.crunchbase.com/login',
            'X-Requested-With': 'XMLHttpRequest',
            'pragma':'no-cache',
            'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
            'Cache-control': 'no-cache',
            // 'Accept-encoding':'br',
            'Accept': 'application/json, text/plain, */*',
            'content-type':'application/json'
        }
    }

    console.log('Autenticando ...')
    
    rp(requestOptions).then(function(response){

        console.log('Autenticacao executada com sucesso')
        
        console.log(response.headers)
        console.log(response.statusCode)
        // Converte a string da resposta em objeto JSON
        
        console.log(response.body)
        // console.log('teste JAIRO $$$')
        // process.exit()

        var jsonLoginValidate = eval(response.body)
        
        // console.log(jsonLoginValidate)
        // process.exit()

        var cookies = []

        cookies.push(response.headers['set-cookie'][0].split(';')[0])
        cookies.push(response.headers['set-cookie'][1].split(';')[0])
        cookies.push(response.headers['set-cookie'][2].split(';')[0])

        console.log('Recuperando cookies iniciais ...')
        console.log(cookies)
        console.log('=====================================')

        // process.exit()

        var config = {
            cookies: cookies,
            jsonLoginValidate: jsonLoginValidate
        }

        callback(config)

    }).catch(function(err){

        console.log(err)
        console.log('########################################')
        console.log('Erro na tentativa de Login !!!')

    })

    console.log('teste')
}

var getListOrganizations = function(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, callback){

        // Define as novas tres letras para o filtro
        var curLetter1 = letters[indexLetter1]
        var curLetter2 = letters[indexLetter2]
        var curLetter3 = letters[indexLetter3]

        var curValueFilter = curLetter1 + curLetter2 + curLetter3

        console.log('Iniciando pesquisa do filtro ' + curValueFilter)
        console.log('=================================================')

        // Solicita um lote de companies para o EndPoint da CrunchBase
        var url = 'https://www.crunchbase.com/v4/data/searches/organization.companies'

        var xsrfToken = config.cookies[0].replace('XSRF-TOKEN=', '')

        var requestOptions = {
            method: 'POST',
            uri: url,
            resolveWithFullResponse: true,
            json: true,
            gzip: true,
            body:{
                "field_ids": [
                    "identifier",
                    "categories",
                    "location_identifiers",
                    "short_description",
                    "rank_org_company"
                ],
                "order": [
                    {
                        "field_id": "rank_org_company",
                        "sort": "asc"
                    }
                ],
                "query": [
                    {
                        "type": "predicate",
                        "field_id": "identifier",
                        "operator_id": "starts",
                        "values": [
                            curValueFilter
                        ]
                    }
                ],
                "field_aggregators": [],
                "limit": 1000,
                "collection_id": "organization.companies"
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
                'Cookie': config.cookies,
                'x-xsrf-token' : xsrfToken,
                'Origin': 'https://www.crunchbase.com',
                'Referer': 'https://www.crunchbase.com/search/organization.companies',
                'X-Requested-With': 'XMLHttpRequest',
                'pragma':'no-cache',
                'accept':'application/json, text/plain, */*',
                'accept-language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
                'cache-control': 'no-cache',
                // 'accept-encoding':'gzip, deflate, br'
                
            }
        }
        
        rp(requestOptions).then(function(response){

            var statusCode = response.statusCode

            // Se request falhou tentar novamente!
            if(statusCode != 200){
                console.log(statusCode)
                setTimeout(function(){
                    getListOrganizations(config, organizacoes, indexLetter1, indexLetter2, indexLetter3, callback)
                }, 3000)
            }
            else{

                var jsonCompanies = eval(response.body)

                console.log(jsonCompanies.entities)

                var totalCompanies = jsonCompanies.entities.length
                console.log('Total Companies: ' + totalCompanies)


                var newIndexLetter1 = 0
                var newIndexLetter2 = 0
                var newIndexLetter3 = 0
                
                if(indexLetter3 == (letters.length - 1)){
                    
                    if(indexLetter2 == (letters.length - 1)){

                        if(indexLetter1 == (letters.length - 1)){
                            console.log('FINALIZADO')
                            process.exit()
                        }
                        else{
                            newIndexLetter1 = indexLetter1 + 1
                        }
                    }
                    else{
                        newIndexLetter1 = indexLetter1
                        newIndexLetter2 = indexLetter2 + 1
                    }
                }
                else{
                    newIndexLetter1 = indexLetter1
                    newIndexLetter2 = indexLetter2
                    newIndexLetter3 = indexLetter3 + 1
                }

                console.log('Filtro ' + curValueFilter + ' finalizado!')
                console.log('Iniciando pesquisa do proximo filtro ...')

                console.log(newIndexLetter1, newIndexLetter2, newIndexLetter3)

                setTimeout(function(){
                    getListOrganizations(config, organizacoes, newIndexLetter1, newIndexLetter2, newIndexLetter3, callback)

                }, (Math.floor(Math.random() * 3000)))
            }

            // var $ = cheerio.load(body)

            // Efetua o mapeamento de dados contidos na pagina
            // var promise = new Promise(function(resolve, reject){

            //     var totalItems =  $('.infinite-item').length
            //     var totalResolved = 0

            //     $('.infinite-item').each(function(key, value){
            //         var href = $(this).find('a').attr('href')

            //         var requestOptions = {
            //             url: href,
            //             resolveWithFullResponse: true,
            //             headers: {
            //                 'Cookie': config.cookies,
            //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
            //             }
            //         }

            //         rp(requestOptions).then(function(response){

            //             var body = response.body
            //             var $ = cheerio.load(body)

            //             var nome = $('.col-md-12').find('h3').text().trim()
            //             var categoria = $('.col-md-12').find('h4.h4-lines-1').text().trim()
                        
            //             var endereco = $('.col-md-12').find('p.p-lines-1').text().trim()
            //             endereco = endereco.split(',')

            //             var cidade = endereco[0] == undefined ? '' : endereco[0].trim()
            //             var estado = endereco[1] == undefined ? '' : endereco[1].trim()
            //             var pais = endereco[1] == undefined ? '' : endereco[1].trim()

            //             var site = $('.col-md-12').find('a.mr-15').attr('href')
            //             var facebook = $('.col-md-12').find('i.fa-facebook').parent().attr('href')
            //             var linkedin = $('.col-md-12').find('i.fa-linkedin').parent().attr('href')
            //             var instagram = $('.col-md-12').find('i.fa-instagram').parent().attr('href')

            //             var titulo = $('div.col-md-8').find('p.lead').text().trim()
            //             var descricao = $('div.col-md-8').find('p').eq(1).text().trim()

            //             var organizacao = {
            //                 'organization_name': nome,
            //                 'category': categoria,
            //                 'city': cidade,
            //                 'state': estado,
            //                 'country' : pais,
            //                 'site': site,
            //                 'facebook':facebook,
            //                 'linkedin': linkedin,
            //                 'instagram': instagram,
            //                 'title': titulo,
            //                 'description': descricao,
            //                 'source' : 'startse'
            //             }

            //             organizacoes.push(organizacao)

            //              conn.query('INSERT INTO tbl_organizations SET ?', organizacao, function(err, rows, fields){

            //                 if(err) throw err

            //                 console.log('Organizacao salva com sucesso no mysql')

            //              })

            //             totalResolved++
                        
            //             if(totalResolved == totalItems){
            //                 resolve()
            //             }

            //         })

            //     })

            // })

            // promise.then(function(){

            //     console.log('Organizacoes do filtro: ' + config.index + " finalizado!")
            //     console.log(organizacoes)

            //     if(config.index == 12){
            //         callback('1')
            //     }
            //     else{
            //         // Inicia o scrap da proximo filtro de organizacoes
            //         config.index += 1
            //         getListOrganizations(config, organizacoes, callback)
            //     }

            // })

    })


}

var getListOrganizationsV2 = function(login, password, organizacoes, indexLetter1, indexLetter2, indexLetter3, callback){

    validateSession(login, password, function(config){

        var curLetter1 = letters[indexLetter1]
        var curLetter2 = letters[indexLetter2]
        var curLetter3 = letters[indexLetter3]

        var curValueFilter = curLetter1 + curLetter2 + curLetter3

        console.log('Iniciando pesquisa do filtro ' + curValueFilter)
        console.log('=================================================')

        // Solicita um lote de companies para o EndPoint da CrunchBase
        var url = 'https://www.crunchbase.com/v4/data/searches/organization.companies'

        var xsrfToken = config.cookies[0].replace('XSRF-TOKEN=', '')

        var requestOptions = {
            method: 'POST',
            uri: url,
            resolveWithFullResponse: true,
            json: true,
            body:{
                "field_ids": [
                    "identifier",
                    "categories",
                    "location_identifiers",
                    "short_description",
                    "rank_org_company"
                ],
                "order": [
                    {
                        "field_id": "rank_org_company",
                        "sort": "asc"
                    }
                ],
                "query": [
                    {
                        "type": "predicate",
                        "field_id": "identifier",
                        "operator_id": "starts",
                        "values": [
                            curValueFilter
                        ]
                    }
                ],
                "field_aggregators": [],
                "limit": 1000,
                "collection_id": "organization.companies"
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
                'Cookie': config.cookies,
                'x-xsrf-token' : xsrfToken
            }
        }
        
        rp(requestOptions).then(function(response){

            var body = response.body

            console.log(response.statusCode)

            var jsonCompanies = eval(body)

            console.log(jsonCompanies.entities)

            var totalCompanies = jsonCompanies.entities.length
            console.log('Total Companies: ' + totalCompanies)


            var newIndexLetter1 = 0
            var newIndexLetter2 = 0
            var newIndexLetter3 = 0
            
            if(newIndexLetter3 == (letters.length - 1)){
                
                if(newIndexLetter2 == (letters.length - 1)){

                    if(newIndexLetter1 == (letters.length - 1)){
                        console.log('FINALIZADO')
                        process.exit()
                    }
                    else{
                        newIndexLetter3 = indexLetter3 + 1
                    }
                }
                else{
                    newIndexLetter2 = indexLetter2 + 1
                }
            }
            else{
                newIndexLetter3 = indexLetter3 + 1
            }

            console.log('Filtro ' + curValueFilter + ' finalizado!')
            console.log('Iniciando pesquisa do proximo filtro ...')

            setTimeout(function(){
                getListOrganizations(login, password, organizacoes, newIndexLetter1, newIndexLetter2, newIndexLetter3, callback)

            }, 500)

            // var $ = cheerio.load(body)

            // Efetua o mapeamento de dados contidos na pagina
            // var promise = new Promise(function(resolve, reject){

            //     var totalItems =  $('.infinite-item').length
            //     var totalResolved = 0

            //     $('.infinite-item').each(function(key, value){
            //         var href = $(this).find('a').attr('href')

            //         var requestOptions = {
            //             url: href,
            //             resolveWithFullResponse: true,
            //             headers: {
            //                 'Cookie': config.cookies,
            //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
            //             }
            //         }

            //         rp(requestOptions).then(function(response){

            //             var body = response.body
            //             var $ = cheerio.load(body)

            //             var nome = $('.col-md-12').find('h3').text().trim()
            //             var categoria = $('.col-md-12').find('h4.h4-lines-1').text().trim()
                        
            //             var endereco = $('.col-md-12').find('p.p-lines-1').text().trim()
            //             endereco = endereco.split(',')

            //             var cidade = endereco[0] == undefined ? '' : endereco[0].trim()
            //             var estado = endereco[1] == undefined ? '' : endereco[1].trim()
            //             var pais = endereco[1] == undefined ? '' : endereco[1].trim()

            //             var site = $('.col-md-12').find('a.mr-15').attr('href')
            //             var facebook = $('.col-md-12').find('i.fa-facebook').parent().attr('href')
            //             var linkedin = $('.col-md-12').find('i.fa-linkedin').parent().attr('href')
            //             var instagram = $('.col-md-12').find('i.fa-instagram').parent().attr('href')

            //             var titulo = $('div.col-md-8').find('p.lead').text().trim()
            //             var descricao = $('div.col-md-8').find('p').eq(1).text().trim()

            //             var organizacao = {
            //                 'organization_name': nome,
            //                 'category': categoria,
            //                 'city': cidade,
            //                 'state': estado,
            //                 'country' : pais,
            //                 'site': site,
            //                 'facebook':facebook,
            //                 'linkedin': linkedin,
            //                 'instagram': instagram,
            //                 'title': titulo,
            //                 'description': descricao,
            //                 'source' : 'startse'
            //             }

            //             organizacoes.push(organizacao)

            //              conn.query('INSERT INTO tbl_organizations SET ?', organizacao, function(err, rows, fields){

            //                 if(err) throw err

            //                 console.log('Organizacao salva com sucesso no mysql')

            //              })

            //             totalResolved++
                        
            //             if(totalResolved == totalItems){
            //                 resolve()
            //             }

            //         })

            //     })

            // })

            // promise.then(function(){

            //     console.log('Organizacoes do filtro: ' + config.index + " finalizado!")
            //     console.log(organizacoes)

            //     if(config.index == 12){
            //         callback('1')
            //     }
            //     else{
            //         // Inicia o scrap da proximo filtro de organizacoes
            //         config.index += 1
            //         getListOrganizations(config, organizacoes, callback)
            //     }

            // })



        }).catch(function(err){

            console.log(err)
            console.log('########################################')
            console.log('Erro na bagaça')

        })
    })


}

getInvestors()