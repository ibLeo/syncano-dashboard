import React from 'react';
import Reflux from 'reflux';
import { withRouter } from 'react-router';
import Helmet from 'react-helmet';
import _ from 'lodash';
import { colors as Colors } from 'material-ui/styles/';

import Store from './InstancesStore';
import Actions from './InstancesActions';
import InstanceDialogActions from './InstanceDialogActions';

import OnboardingDialogContent from '../../common/OnboardingDialogContent/OnboardingDialogContent';

import { DialogsMixin } from '../../mixins';

import { RaisedButton } from 'material-ui';
import { Container, Show, InnerToolbar, Dialog, PageIntro } from '../../common/';

import InstancesList from './InstancesList';
import SharedInstancesList from './SharedInstancesList';

import './Instances.sass';

const Instances = React.createClass({
  mixins: [
    Reflux.connect(Store),
    DialogsMixin
  ],

  componentDidMount() {
    Actions.fetch();

    const { prolongDialog } = this.refs;
    const { query } = this.props.location;

    if (prolongDialog && _.has(query, 'prolong')) {
      prolongDialog.show();
    }
  },

  componentWillUnmount() {
    Store.clearStore();
  },

  getStyles() {
    return {
      blurPageDialog: {
        top: '5%'
      }
    };
  },

  showInstanceDialog() {
    InstanceDialogActions.showDialog();
  },

  transitionToFirstInstance() {
    const { router } = this.props;
    const { myInstances } = this.state;
    const firstInstance = myInstances.length ? myInstances[0].name : null;

    if (firstInstance) {
      router.push(`/instances/${firstInstance}/`);
    }
  },

  initDialogs() {
    return [{
      dialog: Dialog.Delete,
      params: {
        icon: 'synicon-thumb-up-outline',
        iconColor: Colors.green400,
        key: 'prolongDialog',
        ref: 'prolongDialog',
        title: 'Your account has been reactivated.',
        children: (
          <div>
            {`You have successfully reactivated your account. This means, we won't deactivate or delete it anytime soon
            while you will be active.`}
          </div>
        ),
        actions: (
          <RaisedButton
            key="cancel"
            onTouchTap={() => this.handleCancel('prolongDialog')}
            primary={true}
            label="Close"
            ref="cancel"
          />
        )
      }
    }];
  },

  render() {
    const { blocked, isLoading, hideDialogs, myInstances, sharedInstances } = this.state;
    const title = 'Instances';

    if (blocked) {
      return (
        <div className="row vp-5-t">
          <Helmet title="Account blocked" />
          <Container.Empty
            icon="synicon-block-helper"
            text={blocked}
          />
        </div>
      );
    }

    return (
      <div>
        <Helmet title={title} />
        {this.getDialogs()}
        <Show if={sharedInstances.length > 0 && myInstances.length > 0}>
          <InnerToolbar
            title={{
              title,
              [`data-e2e`]: 'instances-page-title'
            }}
          >
            <RaisedButton
              primary={true}
              label="Add"
              style={{ marginRight: 0 }}
              onTouchTap={InstanceDialogActions.showDialog}
            />
          </InnerToolbar>
        </Show>
        <Show if={myInstances.length}>
          <InstancesList
            ref="myInstancesList"
            name="Instances"
            items={myInstances}
            isLoading={isLoading}
            hideDialogs={hideDialogs}
            emptyItemHandleClick={this.showInstanceDialog}
            emptyItemContent="Create an instance"
          />
        </Show>

        <Show if={sharedInstances.length === 0 && myInstances.length === 0}>
          <OnboardingDialogContent />
        </Show>

        <Show if={sharedInstances.length && !isLoading}>
          <SharedInstancesList
            ref="otherInstancesList"
            items={sharedInstances}
            hideDialogs={hideDialogs}
            isLoading={isLoading}
          />
        </Show>
      </div>
    );
  }
});

export default withRouter(PageIntro.HOC(Instances, 'instancesPageIntro'));
