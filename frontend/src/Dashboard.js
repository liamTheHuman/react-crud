import React, { Component } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, TableBody, Table,
  TableContainer, TableHead, TableRow, TableCell
} from '@material-ui/core';
import PhoneInput from 'react-phone-input-2';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
const axios = require('axios');

export default class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      openContactModal: false,
      openContactEditModal: false,
      id: '',
      name: '',
      number: '',
      company: '',
      page: 1,
      search: '',
      contacts: [],
      pages: 0,
      loading: false
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.history.push('/login');
    } else {
      this.setState({ token: token }, () => {
        this.getContact();
      });
    }
  }

  getContact = () => {
    
    this.setState({ loading: true });

    let data = '?';
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios.get(`http://localhost:2000/get-contact${data}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ loading: false, contacts: res.data.contacts, pages: res.data.pages });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, contacts: [], pages: 0 },()=>{});
    });
  }

  deleteContact = (id) => {
    axios.post('http://localhost:2000/delete-contact', {
      id: id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'token': this.state.token
      }
    }).then((res) => {

      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.setState({ page: 1 }, () => {
        this.pageChange(null, 1);
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
    });
  }

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getContact();
    });
  }

  logOut = () => {
    localStorage.setItem('token', null);
    this.props.history.push('/');
  }

  onChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => { });
    if (e.target.name == 'search') {
      this.setState({ page: 1 }, () => {
        this.getContact();
      });
    }
  };

  addContact = () => {

    axios.post('http://localhost:2000/add-contact', {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    }).then((res) => {

      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handleContactClose();
      this.setState({ name: '', number: '', company: '', page: 1 }, () => {
        this.getContact();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleContactClose();
    });

  }

  updateContact = () => {

    axios.post('http://localhost:2000/update-contact', {
      headers: {
        'content-type': 'multipart/form-data',
        'token': this.state.token
      }
    }).then((res) => {

      swal({
        text: res.data.title,
        icon: "success",
        type: "success"
      });

      this.handleContactEditClose();
      this.setState({ name: '', number: '', company: '' }, () => {
        this.getContact();
      });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.handleContactEditClose();
    });

  }

  handleContactOpen = () => {
    this.setState({
      openContactModal: true,
      id: '',
      name: '',
      number: '',
      company: ''
    });
  };

  handleContactClose = () => {
    this.setState({ openContactModal: false });
  };

  handleContactEditOpen = (data) => {
    this.setState({
      openContactEditModal: true,
      id: data._id,
      name: data.name,
      number: data.number,
      company: data.company
    });
  };

  handleContactEditClose = () => {
    this.setState({ openContactEditModal: false });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <h2>Dashboard</h2>
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleContactOpen}
          >
            Add Contact
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
          >
            Log Out
          </Button>
        </div>

        {/* Edit Contact */}
        <Dialog
          open={this.state.openContactEditModal}
          onClose={this.handleContactClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Contact</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Contact Name"
              required
            /><br />
            {/* <PhoneInput
              id="standard-basic"
              autoComplete="off"
              country={'rsa'}
              value={this.state.number}
              onChange={number => this.setState({ number })}
              placeholder="Number"
              required
            /><br /> */}
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="number"
              value={this.state.number}
              onChange={this.onChange}
              placeholder="Number"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="company"
              value={this.state.company}
              onChange={this.onChange}
              placeholder="Company"
              required
            /><br /><br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleContactEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.number == '' || this.state.company == ''}
              onClick={(e) => this.updateContact()} color="primary" autoFocus>
              Edit Contact
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Contact */}
        <Dialog
          open={this.state.openContactModal}
          onClose={this.handleContactClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Contact</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Contact Name"
              required
            /><br />
            {/* <PhoneInput
              id="standard-basic"
              autoComplete="off"
              country={'rsa'}
              value={this.state.number}
              onChange={number => this.setState({ number })}
              placeholder="Number"
              required
            /><br /> */}
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="number"
              value={this.state.number}
              onChange={this.onChange}
              placeholder="Number"
              required
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="company"
              value={this.state.company}
              onChange={this.onChange}
              placeholder="Company"
              required
            /><br /><br />
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleContactClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.number == null ||  this.state.company == ''}
              onClick={(e) => this.addContact()} color="primary" autoFocus>
              Add Contact
            </Button>
          </DialogActions>
        </Dialog>

        <br />

        <TableContainer>
          <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.onChange}
            placeholder="Search by contact name"
            required
          />
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Name</TableCell>
                <TableCell align="center">Number</TableCell>
                <TableCell align="center">Company</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.contacts.map((row) => (
                <TableRow key={row.name}>
                  <TableCell align="center" component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell align="center">{row.number}</TableCell>
                  <TableCell align="center">{row.company}</TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleContactEditOpen(row)}
                    >
                      Edit
                  </Button>
                    <Button
                      className="button_style"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteContact(row._id)}
                    >
                      Delete
                  </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
          <Pagination count={this.state.pages} page={this.state.page} onChange={this.pageChange} color="primary" />
        </TableContainer>

      </div>
    );
  }
}