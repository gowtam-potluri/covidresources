import React from 'react';
import { Link } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import {
  Col, Panel, Form, FormGroup, FormControl, ControlLabel,
  ButtonToolbar, Button, Alert,
} from 'react-bootstrap';
import graphQLFetch from './graphQLFetch.js';
import NumInput from './NumInput.jsx';
import DateInput from './DateInput.jsx';
import TextInput from './TextInput.jsx';
import withToast from './withToast.jsx';
import store from './store.js';
import UserContext from './UserContext.js';
import {ToastContainer,toast} from 'react-toastify'

class IssueEdit extends React.Component {
  notify = () => toast("Cant Modify other Users Posts!");
  static async fetchData(match, search, showError) {
    const query = `query issue($id: Int!) {
      issue(id: $id) {
        id district available name
        quantity created phone description username
      }
    }`;

    const { params: { id } } = match;
    const result = await graphQLFetch(query, { id }, showError);
    return result;
  }

  

 
  
  constructor() {
    super();
    global.userLogin = "empty";
    const issue = store.initialData ? store.initialData.issue : null;
    delete store.initialData;
    this.state = {
      issue,
      invalidFields: {},
      showingValidation: false,
      username:"empty",
     
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
    this.showValidation = this.showValidation.bind(this);
    

  }

  componentDidMount() {

   
    const { issue } = this.state;
    if (issue == null) this.loadData();
    
   
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } } } = prevProps;
    const { match: { params: { id } } } = this.props;
    if (id !== prevId) {
      this.loadData();
    }
  }

  onChange(event, naturalValue) {
    const { name, value: textValue } = event.target;
    const value = naturalValue === undefined ? textValue : naturalValue;
    this.setState(prevState => ({
      issue: { ...prevState.issue, [name]: value },
    }));
  }

  onValidityChange(event, valid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.showValidation();
    const { issue, invalidFields } = this.state;
    issue.username = this.context.givenName;
    if (Object.keys(invalidFields).length !== 0) return;

    const query = `mutation resissueUpdate(
      $id: Int!
      $changes: ResIssueUpdateInputs!
    ) {
      resissueUpdate(
        id: $id
        changes: $changes
      ) {
        id district available name
        quantity created phone description username
      }
    }`;

    const { id, created, ...changes } = issue;
    const { showSuccess, showError } = this.props;
    
    const data = await graphQLFetch(query, { changes, id }, showError);
    if (data) {
      this.setState({ issue: data.resissueUpdate });
      showSuccess('Updated issue successfully');
    }
  }

  async loadData() {
    console.log('tes');
    const { match, showError } = this.props;
    const data = await IssueEdit.fetchData(match, null, showError);
    this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
    global.userLogin = this.state.issue.username;
  }
  showValidation() {
    this.setState({ showingValidation: true });
  }

  dismissValidation() {
    this.setState({ showingValidation: false });
  }

 
  render() {
    const { issue } = this.state;
    if (issue == null) return null;
    const { issue: { id } } = this.state;
    const { match: { params: { id: propsId } } } = this.props;
    if (id == null) {
      if (propsId != null) {
        return <h3>{`Issue with ID ${propsId} not found.`}</h3>;
      }
      return null;
    }

    const { invalidFields, showingValidation } = this.state;
    let validationMessage;
    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fields before submitting.
        </Alert>
      );
    }

    const { issue: { district, available } } = this.state;
    const { issue: { name, quantity, description } } = this.state;
    const { issue: { created, phone } } = this.state;
    const username = issue.username;
    
  
    const user = this.context;
    
    //console.log(user,issue);

    return (
      <Panel>
        
        <Panel.Heading>
          <Panel.Title>{`Editing issue: ${id}`}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Created</Col>
              <Col sm={9}>
                <FormControl.Static>
                  {created.toDateString()}
                </FormControl.Static>
              </Col>
            </FormGroup>
            
            <FormGroup>
              
              <Col componentClass={ControlLabel} sm={3}>Available</Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  name="available"
                  value={available}
                  onChange={this.onChange}
                >
                  <option value="True">True</option>
                  <option value="False">False</option>
                  </FormControl>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Name</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  name="name"
                  value={name}
                  onChange={this.onChange}
                  key={id}
                />
               </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Quantity</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={NumInput}
                  name="quantity"
                  value={quantity}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup validationState={
              invalidFields.phone ? 'error' : null
            }
            >
              <Col componentClass={ControlLabel} sm={3}>Phone</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  onValidityChange={this.onValidityChange}
                  name="phone"
                  value={phone}
                  onChange={this.onChange}
                  onValidityChange={this.onValidityChange}
                  key={id}
                />
              <FormControl.Feedback />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>District</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  size={50}
                  name="district"
                  value={district}
                  onChange={this.onChange}
                  key={id}
                />
               </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={3}>Description</Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  tag="textarea"
                  rows={4}
                  cols={50}
                  name="description"
                  value={description}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={6}>
                <ButtonToolbar>
                  {username == user.givenName &&
                <Button
                    disabled={!user.signedIn}
                    bsStyle="primary"
                    type="submit"
                  >
                    Submit
                  </Button>
  }
  {username != user.givenName 
    && <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
    Cannot Modify other users posts! Please go back
  </Alert>
  }
                  <LinkContainer to="/issues">
                    <Button bsStyle="link">Back</Button>
                  </LinkContainer>
                </ButtonToolbar>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={3} sm={9}>{validationMessage}</Col>
            </FormGroup>
          </Form>

        </Panel.Body>
        <Panel.Footer>
          <Link to={`/edit/${id - 1}`}>Prev</Link>
          {' | '}
          <Link to={`/edit/${id + 1}`}>Next</Link>
        </Panel.Footer>
        
      </Panel>
    );
  }
}

IssueEdit.contextType = UserContext;

const IssueEditWithToast = withToast(IssueEdit);
IssueEditWithToast.fetchData = IssueEdit.fetchData;

export default IssueEditWithToast;