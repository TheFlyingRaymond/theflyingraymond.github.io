---
icon: pen-to-square
date: 2024-12-30
category:
  - MyBatis
tag:
  - 支线
---

# MyBatis使用1：MyBatis配置

MyBatis配置

<!-- more -->

https://mybatis.org/mybatis-3/zh/configuration.html

## 一、属性（properties）
就是正常的properties，可以在别的配置文件中写，也可以在mybatis的配置文件中写，写完之后可以在mybatis配置文件中的其它地方引用
```xml
<properties resource="org/mybatis/example/config.properties">
  <property name="username" value="dev_user"/>
  <property name="password" value="F2Fa3!33TYyg"/>
</properties>

<dataSource type="POOLED">
  <property name="driver" value="${driver}"/>
  <property name="url" value="${url}"/>
  <property name="username" value="${username}"/>
  <property name="password" value="${password}"/>
</dataSource>
```
另一种方式是在SqlSessionFactoryBuilder.build()中作为方法参数传递
```java
SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, props);

// ... 或者 ...

SqlSessionFactory factory = new SqlSessionFactoryBuilder().build(reader, environment, props);
```

如果在多个地方有重复配置，则加载顺序为：
1. 先读取properties中设置的值
2. 根据properties中的resource指定的位置读取，遇到重复的就覆盖
3. 最后读取作为方法传递的值，遇到重复的就覆盖（最高优先级）

默认值的配置：
从mybatis3.4.2开始，你可以指定一个默认值，但是首先要开启默认值功能，该功能默认是关闭的
```xml
<properties resource="org/mybatis/example/config.properties">
  <!-- ... -->
  <!-- 启用默认值特性 -->
  <property name="org.apache.ibatis.parsing.PropertyParser.enable-default-value" value="true"/> 
</properties>

<dataSource type="POOLED">
  <!-- ... -->
  <!-- 如果属性 'username' 没有被配置，'username' 属性的值将为 'ut_user' -->
  <property name="username" value="${username:ut_user}"/> 
</dataSource>
```

有时候冒号分隔符可能会有其它的含义，比如在SQL中使用了OGNL表达式的三目表达式，此时如果你还想继续使用默认值功能，就需要重新定义一下默认值的分割符，例如将其改为“?:”
```xml
<properties resource="org/mybatis/example/config.properties">
  <!-- ... -->
  <!-- 修改默认值的分隔符 -->
  <property name="org.apache.ibatis.parsing.PropertyParser.default-value-separator" value="?:"/>
</properties>

<dataSource type="POOLED">
  <!-- ... -->
  <property name="username" value="${db:username?:ut_user}"/>
</dataSource>
```

## 二、设置（settings）
https://mybatis.org/mybatis-3/zh/configuration.html#settings
```xml
jdbc_poolType=c3p0
jdbc_initialPoolSize=4
jdbc_minPoolSize=4
jdbc_maxPoolSize=16
jdbc_maxIdleTime=3
jdbc_idleConnectionTestPeriod=60
jdbc_testConnectionOnCheckin=false
jdbc_preferredTestQuery=SELECT 1
jdbc_connectionInitSqls=SET NAMES utf8mb4
jdbc_extraJdbcUrlParams=zeroDateTimeBehavior=convertToNull&connectTimeout=1000&socketTimeout=3000
```

## 三、类型别名（typeAliases）
给Java的类型取一个别名，只用于XML文件中，比如在resultMap中配置类型时。意图是避免写全类名的麻烦。三种方式：
1. 在配置文件中单个类配置
2. 在配置文件中包配置
3. 用注解在类上配置
```xml
<typeAliases>
  <typeAlias alias="Author" type="domain.blog.Author"/>
  <typeAlias alias="Blog" type="domain.blog.Blog"/>
  <typeAlias alias="Comment" type="domain.blog.Comment"/>
  <typeAlias alias="Post" type="domain.blog.Post"/>
  <typeAlias alias="Section" type="domain.blog.Section"/>
  <typeAlias alias="Tag" type="domain.blog.Tag"/>
</typeAliases>
<typeAliases>
  <package name="domain.blog"/>
</typeAliases>
```

```java
//如果没有注解值，则默认取类名首字母小写
@Alias("author")
public class Author {
    ...
}
```

另外，还有一些内置好的类型别名，其中有些采用了特殊的命名方式，为的是避免与原始类型命名冲突，很有意思，long的别名是_long，Long的别名是long，这也是为了符合常用类吧
| 别名       | 映射的类型   | 别名          | 映射的类型         |
|------------|--------------|---------------|--------------------|
| _byte      | byte         | float         | Float              |
| _char      | char         | boolean       | Boolean            |
| _character | char         | date          | Date               |
| _long      | long         | decimal       | BigDecimal         |
| _short     | short        | bigdecimal    | BigDecimal         |
| _int       | int          | biginteger    | BigInteger         |
| _integer   | int          | object        | Object             |
| _double    | double       | date[]        | Date[]             |
| _float     | float        | decimal[]     | BigDecimal[]       |
| _boolean   | boolean      | bigdecimal[]  | BigDecimal[]       |
| string     | String       | biginteger[]  | BigInteger[]       |
| byte       | Byte         | object[]      | Object[]           |
| char       | Character    | map           | Map                |
| character  | Character    | hashmap       | HashMap            |
| long       | Long         | list          | List               |
| short      | Short        | arraylist     | ArrayList          |
| int        | Integer      | collection    | Collection         |
| integer    | Integer      | iterator      | Iterator           |
| double     | Double       |               |                    |


## 四、对象工厂（objectFactory）
每次 MyBatis 创建结果对象的新实例时，它都会使用一个对象工厂（ObjectFactory）实例来完成实例化工作。 默认的对象工厂需要做的仅仅是实例化目标类，要么通过默认无参构造方法，要么通过存在的参数映射来调用带有参数的构造方法。 如果想覆盖对象工厂的默认行为，可以通过创建自己的对象工厂来实现。比如：
```java
// ExampleObjectFactory.java
public class ExampleObjectFactory extends DefaultObjectFactory {
  @Override
  public <T> T create(Class<T> type) {
    return super.create(type);
  }

  @Override
  public <T> T create(Class<T> type, List<Class<?>> constructorArgTypes, List<Object> constructorArgs) {
    return super.create(type, constructorArgTypes, constructorArgs);
  }

  @Override
  public void setProperties(Properties properties) {
    super.setProperties(properties);
  }

  @Override
  public <T> boolean isCollection(Class<T> type) {
    return Collection.class.isAssignableFrom(type);
  }
}
```

然后在配置文件中指定对象工厂
```xml
<!-- mybatis-config.xml -->
<objectFactory type="org.mybatis.example.ExampleObjectFactory">
  <property name="someProperty" value="100"/>
</objectFactory>
```

## 五、环境配置（environments）
配置多个环境可以用于test、st、prod等环境的隔离，但是每个SqlSessionFactory只能选一个环境，你想链接俩数据，就创建俩SqlSessionFactory
```xml
<environments default="development">
  <environment id="development">
    <transactionManager type="JDBC">
      <property name="..." value="..."/>
    </transactionManager>
    <dataSource type="POOLED">
      <property name="driver" value="${driver}"/>
      <property name="url" value="${url}"/>
      <property name="username" value="${username}"/>
      <property name="password" value="${password}"/>
    </dataSource>
  </environment>
</environments>
```

事务管理器
Mybatis中支持两种事务管理器：JDBC | MANAGED
- JDBC：直接使用了JDBC的提交和回滚功能，默认每次关闭连接时自动提交，从3.5.10开始，可通过skipSetAutoCommitOnClose设置为true关闭
- MANAGED：不会提交或回滚，而是让容器管理事务生命周期，默认情况下它会关闭链接，可通过closeConnection=false来阻止
如果你使用Spring+Maybatis，那无需配置事务管理器，因为Spring会用自带的事务管理器来覆盖前面的

这两个值其实是别名，你可以实现自己的事务管理器，然后其全类名或者别名代替这两个值。想要实现事务管理器，实现TransactionFactory接口，在创建一个Transaction的实现类。但是基本上你是不需要自己实现任务管理器的
可查看org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory
```java
public interface TransactionFactory {
    default void setProperties(Properties props) { // 从 3.5.2 开始，该方法为默认方法
        // 空实现
    }
    Transaction newTransaction(Connection conn);
    Transaction newTransaction(DataSource dataSource, TransactionIsolationLevel level, boolean autoCommit);
}

public interface Transaction {
    Connection getConnection() throws SQLException;
    void commit() throws SQLException;
    void rollback() throws SQLException;
    void close() throws SQLException;
    Integer getTimeout() throws SQLException;
}
```
数据源
在和Spring整合中，数据源的配置已经不再放在environments下面了，这部分可以直接看和Spring的整合

## 六、映射器（mappers）
映射器的目的是告诉Mybatis去哪里找SQL语句
```xml
<!-- 使用相对于类路径的资源引用 -->
<mappers>
  <mapper resource="org/mybatis/builder/AuthorMapper.xml"/>
  <mapper resource="org/mybatis/builder/BlogMapper.xml"/>
  <mapper resource="org/mybatis/builder/PostMapper.xml"/>
</mappers>

<!-- 使用完全限定资源定位符（URL） -->
<mappers>
  <mapper url="file:///var/mappers/AuthorMapper.xml"/>
  <mapper url="file:///var/mappers/BlogMapper.xml"/>
  <mapper url="file:///var/mappers/PostMapper.xml"/>
</mappers>

<!-- 使用映射器接口实现类的完全限定类名 -->
<mappers>
  <mapper class="org.mybatis.builder.AuthorMapper"/>
  <mapper class="org.mybatis.builder.BlogMapper"/>
  <mapper class="org.mybatis.builder.PostMapper"/>
</mappers>

<!-- 将包内的映射器接口全部注册为映射器 -->
<mappers>
  <package name="org.mybatis.builder"/>
</mappers>
```
