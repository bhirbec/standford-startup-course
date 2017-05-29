<div style={{marginTop: '50px'}}>
    <h1>Sign up <span className="salmon">now</span>.</h1>

    <form action="/register" method="post" className="form-inline" style={{marginTop: '20px'}}>
        <input type="hidden" name="src" value={this.props.src} />
        <div className="form-group">
            <input id="email" type="text" name="email" className="form-control" placeholder="Email" />
        </div>
        <div className="form-group">
            <button id="submit"  type="submit" className="btn btn-danger">Send</button>
        </div>
    </form>
</div>
