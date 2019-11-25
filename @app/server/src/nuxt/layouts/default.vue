<template>
  <Layout>
    <Header>
      <Row type="flex" justify="space-between">
        <Col span="6">
          <NuxtLink to="/">Home</NuxtLink>
        </Col>
        <Col>
          <h3>{{ state.title }} - {{ state.projectName }}</h3>
        </Col>
        <Col span="6" style="textAlign: right">
          <DropdownButton v-if="state.isLoggedIn">
            User
            <Menu slot="overlay">
              <MenuItem>
                <NuxtLink to="/settings">
                  <Warn :okay="false">Settings</Warn>
                </NuxtLink>
              </MenuItem>
              <MenuItem>
                <a onClick="{handleLogout}">Logout</a>
              </MenuItem>
            </Menu>
          </DropdownButton>
          <NLink v-if="!state.isLoggedIn" to="/login">
            <a class="header-login-button">Sign in</a>
          </NLink>
        </Col>
      </Row>
    </Header>
    <Content>
      <Nuxt />
    </Content>
    <Footer style="display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between'">
      <div>
        <div>
          Copyright &copy; {{ new Date().getFullYear() }}
          {{ state.companyName }}. All rights reserved.
          <span
            v-if="state.T_AND_C_URL"
          >
            <a :href="state.T_AND_C_URL">Terms and conditions</a>
          </span>
        </div>
        <div>
          Powered by
          <a
            style="color: '#fff', textDecoration: 'underline'"
            href="https://graphile.org/postgraphile"
          >PostGraphile</a>
        </div>
      </div>
    </Footer>
  </Layout>
</template>

<script lang="ts">
import { Layout, Avatar, Row, Col, Dropdown, Icon, Menu } from "ant-design-vue";
import {
  SetupContext,
  computed,
  createComponent,
  reactive,
} from "@vue/composition-api";
import Warn from "~/components/Warn.vue";
//! importing is not working, because of `module: "commonjs"` in @app/config
import { projectName, companyName } from "@app/config"; // TODO: figure out how to properly import without throwing uncaught reference error about "export"
import { SharedLayoutQuery } from "@app/graphql";

// import * as apollo from "@nuxtjs/apollo";
// const _qgl = SharedLayoutQuery;

// import Component from 'vue-class-component'
// import {Component} from   "@nuxt/types",
// // import {Component} from   "node",
// import {Component} from   "@nuxt/vue-app",
// import {Component} from   "@nuxtjs/apollo"
// Register the router hooks with their names
// Component.registerHooks(["apollo"]);

export default createComponent({
  name: "DefaultLayout",
  apollo: {
    // Simple query that will update the currentUser
    currentUser: SharedLayoutQuery,
  },
  components: {
    Avatar,
    Col,
    Dropdown,
    DropdownButton: Dropdown.Button,
    Header: Layout.Header,
    Icon,
    Layout,
    Menu,
    MenuItem: Menu.Item,
    Row,
    SubMenu: Menu.SubMenu,
    Warn,
  },
  setup(_props, ctx: SetupContext) {
    const state = reactive({
      title: "No title",
      projectName: projectName,
      companyName: companyName,
      isLoggedIn: computed(() => false),
      T_AND_C_URL: process.env.T_AND_C_URL,
    });

    return { state };
  },
});
</script>
<style lang="less" scoped>
.ant-layout-header {
  background: #fff;
  background-color: rgb(255, 255, 255);
  box-shadow: 0 2px 8px #f0f1f2;
  z-index: 10;
  max-width: 100%;
}
img {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}
</style>
