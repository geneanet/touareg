import Axios from 'axios'

function NomadWatcher(url) {
    this._url = url
    this._callback_update = []
    this._callback_error = []
    this._watcher = null
    this._index = null
    this._canceller = null

    this.onUpdate = callback => {
        this._callback_update.push(callback)
        return this
    }

    this.onError = callback => {
        this._callback_error.push(callback)
        return this
    }

    this.watch = () => {
        this._canceller = Axios.CancelToken.source()

        if (this._index) {
            this._watcher = Axios.get(this._url, {
                params: { index: this._index },
                cancelToken: this._canceller.token
            })
        } else {
            this._watcher = Axios.get(this._url, {
                cancelToken: this._canceller.token
            })
        }

        this._watcher.then(request => {
            if (request.status < 200 || request.status >= 300) {
                this._callback_error.forEach(callback => { callback('Unexpected status code: ' + request.status) })
            }
            if (request.headers['x-nomad-index']) {
                this._index = request.headers['x-nomad-index']
                this.watch()
            }
            this._callback_update.forEach(callback => { callback(request.data) })
        }).catch(error => {
            if (error != 'Cancel') {
                this._callback_error.forEach(callback => { callback(error) })
            }
        })

        return this
    }

    this.cancel = () => {
        if (this._canceller) {
            this._canceller.cancel()
        }
    }

    this.refresh = () => {
        this.cancel()
        this.watch()
    }
}

export default NomadWatcher
