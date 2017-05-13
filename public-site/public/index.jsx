<html lang="en">
<head>
    <meta charSet="utf-8" />
    <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="" />
    <meta name="author" content="" />
    <title>Landing Page - Start Bootstrap Theme</title>

    <link href="css/bootstrap.min.css" rel="stylesheet" />
    <link href="css/landing-page.css?1" rel="stylesheet" />
    <link href="font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css" />
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
    <nav className="navbar navbar-default navbar-fixed-top topnav" role="navigation">
        <div className="container topnav">
            <div className="navbar-header">
                <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand topnav" href="#">W-101</a>
            </div>
            <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul className="nav navbar-nav navbar-right">
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <a name="about"></a>
    <div className="intro-header">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="intro-message">
                        <h1>Resume built by the crowd!</h1>
                        <h3>Use your network to create your one-page resume</h3>
                        <hr className="intro-divider" />
                        <ul className="list-inline intro-social-buttons">
                            <li>
                                <a href="https://twitter.com/SBootstrap" className="btn btn-default btn-lg">
                                    <i className="fa fa-twitter fa-fw"></i>
                                    <span className="network-name">Twitter</span>
                                </a>
                            </li>
                            <li>
                                <a href="https://github.com/IronSummitMedia/startbootstrap" className="btn btn-default btn-lg">
                                    <i className="fa fa-github fa-fw"></i>
                                    <span className="network-name">Github</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="btn btn-default btn-lg">
                                    <i className="fa fa-linkedin fa-fw"></i>
                                    <span className="network-name">Linkedin</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

	<a  name="services"></a>
    <div className="content-section-a">
        <div className="container">
            <div className="row">
                <div className="col-lg-5 col-sm-6">
                    <hr className="section-heading-spacer" />
                    <div className="clearfix"></div>
                    <h2 className="section-heading">How does it work?</h2>
                    <p className="lead">A special thanks to <a target="_blank" href="http://join.deathtothestockphoto.com/">Death to the Stock Photo</a> for providing the photographs that you see in this template. Visit their website to become a member.</p>
                </div>
                <div className="col-lg-5 col-lg-offset-2 col-sm-6">
                    <img className="img-responsive" src="img/ipad.png" alt="" />
                </div>
            </div>
        </div>
    </div>

    <div className="content-section-b">
        <div className="container">
            <div className="row">
                <div className="col-lg-5 col-lg-offset-1 col-sm-push-6  col-sm-6">
                    <hr className="section-heading-spacer" />
                    <div className="clearfix"></div>
                    <h2 className="section-heading">3D Device Mockups<br />by PSDCovers</h2>
                    <p className="lead">Turn your 2D designs into high quality, 3D product shots in seconds using free Photoshop actions by <a target="_blank" href="http://www.psdcovers.com/">PSDCovers</a>! Visit their website to download some of their awesome, free photoshop actions!</p>
                </div>
                <div className="col-lg-5 col-sm-pull-6  col-sm-6">
                    <img className="img-responsive" src="img/dog.png" alt="" />
                </div>
            </div>
        </div>
    </div>

    <div className="content-section-a">
        <div className="container">
            <div className="row">
                <div className="col-lg-5 col-sm-6">
                    <hr className="section-heading-spacer" />
                    <div className="clearfix"></div>
                    <h2 className="section-heading">Google Web Fonts and<br />Font Awesome Icons</h2>
                    <p className="lead">This template features the 'Lato' font, part of the <a target="_blank" href="http://www.google.com/fonts">Google Web Font library</a>, as well as <a target="_blank" href="http://fontawesome.io">icons from Font Awesome</a>.</p>
                </div>
                <div className="col-lg-5 col-lg-offset-2 col-sm-6">
                    <img className="img-responsive" src="img/phones.png" alt="" />
                </div>
            </div>

        </div>
    </div>

	<a  name="contact"></a>
    <div className="banner">
        <div className="container">
            <div className="row">
                <div className="col-lg-6">
                    <h2>Connect to Start Bootstrap:</h2>
                </div>
                <div className="col-lg-6">
                    <ul className="list-inline banner-social-buttons">
                        <li>
                            <a href="https://twitter.com/SBootstrap" className="btn btn-default btn-lg"><i className="fa fa-twitter fa-fw"></i> <span className="network-name">Twitter</span></a>
                        </li>
                        <li>
                            <a href="https://github.com/IronSummitMedia/startbootstrap" className="btn btn-default btn-lg"><i className="fa fa-github fa-fw"></i> <span className="network-name">Github</span></a>
                        </li>
                        <li>
                            <a href="#" className="btn btn-default btn-lg"><i className="fa fa-linkedin fa-fw"></i> <span className="network-name">Linkedin</span></a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <footer>
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <ul className="list-inline">
                        <li><a href="#">Home</a></li>
                        <li className="footer-menu-divider">&sdot;</li>
                        <li><a href="#about">About</a></li>
                        <li className="footer-menu-divider">&sdot;</li>
                        <li><a href="#services">Services</a></li>
                        <li className="footer-menu-divider">&sdot;</li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                    <p className="copyright text-muted small">Copyright &copy; Your Company 2014. All Rights Reserved</p>
                </div>
            </div>
        </div>
    </footer>

    <script src="js/jquery.js"></script>
    <script src="js/bootstrap.min.js"></script>
</body>
</html>
