<html lang="en">
<head>
    <link rel="icon" href={asset("/public/img/favicon.jpg")} type="image/x-icon"/>
    <meta charSet="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <title>LetsResume - Resume built by the crowd</title>

    <link href={asset("/public/css/bootstrap.min.css")} rel="stylesheet" />
    <link href={asset("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-social/5.1.1/bootstrap-social.min.css")} rel="stylesheet" />
    <link href={asset("/public/css/landing-page.css")} rel="stylesheet" />
    <link href={asset("/public/font-awesome/css/font-awesome.min.css")} rel="stylesheet" type="text/css" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-social/5.1.1/bootstrap-social.css" rel="stylesheet" type="text/css" />
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css" />

    {/* HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries */}
    {/* WARNING: Respond.js doesn't work if you view the page via file:// */}
    <meta name="react-comment-hack" dangerouslySetInnerHTML={{__html: `
        <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
            <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
        <![endif]-->`}}>
    </meta>
</head>
<body>
    <nav className="navbar navbar-default navbar-fixed-top topnav" role="navigation"
         style={{ backgroundColor: 'transparent' }}>
        <div className="container topnav">
            <div className="navbar-header">
                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <a id="logo" className="navbar-brand topnav" href="/">
                   <span>LETS</span>
                   <span className="salmon">RESUME</span>
                </a>
            </div>
        </div>
    </nav>

    <div className="intro-header">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="intro-message">
                        <h1>
                            Your resume, <span className="salmon">built by the crowd.</span>
                        </h1>
                        <h2 style={{marginTop: '50px'}}>
                            Never write a résumé again!<br />
                            Your network will do it for you.
                        </h2>

                        <Content />
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src={asset("/public/js/jquery.js")}></script>
    <script src={asset("/public/js/bootstrap.min.js")}></script>
</body>
</html>
