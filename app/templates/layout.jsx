<html lang="en">
<head>
    <meta charset="utf-8" />

    <script async src={`https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics.trackingId}`}></script>
    <script dangerouslySetInnerHTML={{__html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments)};
    `}}></script>

    <link rel="icon" href={asset("/public/img/favicon.jpg")} type="image/x-icon"/>
    <meta charSet="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <title>LetsResume - Resume built by the crowd</title>

    <link href={asset("/public/css/bootstrap.min.css")} rel="stylesheet" />
    <link href={asset("https://cdnjs.cloudflare.com/ajax/libs/bootstrap-social/5.1.1/bootstrap-social.min.css")} rel="stylesheet" />
    <link href={asset("/public/font-awesome/css/font-awesome.min.css")} rel="stylesheet" type="text/css" />
    <link href={asset("/public/css/landing-page.css")} rel="stylesheet" />
    <link href={asset("/public/css/Draft.css")} rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700,300italic,400italic,700italic" rel="stylesheet" type="text/css" />

    <script src="https://cdn.firebase.com/libs/firebaseui/2.4.1/firebaseui.js"></script>
    <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/2.4.1/firebaseui.css" />

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
    <script src={asset("/public/js/jquery.js")}></script>
    <script src={asset("/public/js/bootstrap.min.js")}></script>
    <script src="https://www.gstatic.com/firebasejs/4.1.2/firebase.js"></script>
    <script dangerouslySetInnerHTML={{__html: "window.config = " + JSON.stringify(config)}}></script>
    <script src={asset("/build/lib.js")}></script>
    <script src={asset("/build/index.js")}></script>

    <div id="app"><Content /></div>
    <link rel="stylesheet" href="https://unpkg.com/react-select/dist/react-select.css" />
    <script dangerouslySetInnerHTML={{__html: "window.init()"}}></script>
</body>
</html>
