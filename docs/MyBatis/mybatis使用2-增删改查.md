---
icon: pen-to-square
date: 2024-12-30
category:
  - MyBatis
tag:
  - 支线
---

# MyBatis使用2：增删改查

增删改查的配置

<!-- more -->

## 一、Insert、update、delete
```xml
<insert
  <!-- 方法id -->
  id="insertAuthor"
  <!-- 入参类型全限定名或别名 -->
  parameterType="domain.blog.Author"
  <!-- 设置为true后，只要语句被调用都会导致本地缓存和二级缓存失效，
  默认值：（对 insert、update 和 delete 语句）true。 --> 
  flushCache="true"
  <!-- 可选 STATEMENT，PREPARED 或 CALLABLE。这会让 MyBatis 分别使用 Statement，
  PreparedStatement 或 CallableStatement，默认值：PREPARED。-->
  statementType="PREPARED"
  <!-- （仅适用于 insert 和 update）指定能够唯一识别对象的属性，
  MyBatis 会使用 getGeneratedKeys 的返回值或 insert 语句的 selectKey 子元素设置它的值，
  默认值：未设置（unset）。如果生成列不止一个，可以用逗号分隔多个属性名称。 -->
  keyProperty=""
  <!-- （仅适用于 insert 和 update）设置生成键值在表中的列名，
  在某些数据库（像 PostgreSQL）中，当主键列不是表中的第一列的时候，是必须设置的。
  如果生成列不止一个，可以用逗号分隔多个属性名称。 --> 
  keyColumn=""
  <!-- （仅适用于 insert 和 update）这会令 MyBatis 使用 JDBC 的
  getGeneratedKeys 方法来取出由数据库内部生成的主键
  （比如：像 MySQL 和 SQL Server 这样的关系型数据库管理系统的自动递增字段），
  默认值：false。 --> 
  useGeneratedKeys=""
  <!-- 这个设置是在抛出异常之前，驱动程序等待数据库返回请求结果的秒数。
  默认值为未设置（unset）（依赖数据库驱动）。 --> 
  timeout="20"
  >
  
<update
  id="updateAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  timeout="20">

  <delete
  id="deleteAuthor"
  parameterType="domain.blog.Author"
  flushCache="true"
  statementType="PREPARED"
  timeout="20">

上文说到当useGeneratedKeys时，MyBatis会使用getGeneratedKeys方法获取由数据库生成的主键，但是有时候有些数据库不支持这种方式，此时需要使用selectKey元素来设置一下主键生成方式。不同的数据库有不同的方式，使用的时候去查一下即可，这里只需要知道有这么个东西存在
<insert id="insertAuthor">
  <selectKey keyProperty="id" resultType="int" order="BEFORE">
    select CAST(RANDOM()*1000000 as INTEGER) a from SYSIBM.SYSDUMMY1
  </selectKey>
  insert into Author
    (id, username, password, email,bio, favourite_section)
  values
    (#{id}, #{username}, #{password}, #{email}, #{bio}, #{favouriteSection,jdbcType=VARCHAR})
</insert>
```

## 二、Select
- 使用resultType的时候，sql语句中要把列名转成java对象字段名，或者开启mapUnderscoreToCamelCase配置，改配置默认false的。
- resultType和resultMap只能选一个
- 返回多个时，返回值可以是列表或者数组（一般用列表）
```xml
<select
  <!-- 方法id -->
  id="selectPerson" 
  <!-- 入参类型的全限定名或别名，可选，可以自动推断-->
  parameterType="int"  
  <!-- 过时了不要用 -->
  parameterMap="deprecated"
  <!-- 返回的数据类型，注意如果返回的是集合，这里要写的是集合包含的元素的类型， -->
  resultType="hashmap" 
  <!-- 和resultType类似的作用，建议使用这个，详情看resultmap配置 -->
  resultMap="personResultMap"  
  <!-- 设置为true后，只要语句被调用都会导致本地缓存和二级缓存失效，默认false -->
  flushCache="false"  
  <!-- 开启后会本地缓存和二级缓存，对select来说默认true -->
  useCache="true"  
  <!-- 异常抛出前等待返回的时长，默认是unset依赖数据库驱动 -->
  timeout="10"  
  <!-- 给驱动的一个建议值，让驱动每次返回的结果数等于这个，默认unset依赖驱动 -->
  fetchSize="256"  
  <!-- 可选 STATEMENT，PREPARED 或 CALLABLE。
  这会让 MyBatis 分别使用 Statement，PreparedStatement 或 CallableStatement，
  默认值：PREPARED -->
  statementType="PREPARED"  
  <!-- FORWARD_ONLY，SCROLL_SENSITIVE, SCROLL_INSENSITIVE 或 DEFAULT（等价于 unset）
  中的一个，默认值为 unset （依赖数据库驱动）。 -->
  resultSetType="FORWARD_ONLY"
  >
```

## 三、SQL片段
```xml
<sql id="userColumns"> ${alias}.id,${alias}.username,${alias}.password </sql>
```
用sql写的片段可以在别的语句中进行引用并进行变量填充，比如
```xml
<select id="selectUsers" resultType="map">
  select
    <include refid="userColumns"><property name="alias" value="t1"/></include>,
    <include refid="userColumns"><property name="alias" value="t2"/></include>
  from some_table t1
    cross join some_table t2
</select>
```
还可以嵌套使用
```xml
<sql id="sometable">
  ${prefix}Table
</sql>
<sql id="someinclude">
  from
    <include refid="${include_target}"/>
</sql>

<select id="select" resultType="map">
  select
    field1, field2, field3
  <include refid="someinclude">
    <property name="prefix" value="Some"/>
    <property name="include_target" value="sometable"/>
  </include>
</select>
```

## 四、入参映射
入参是一个参数（基本数据类型或者javaBean）的时候，用参数名就可以获取变量，当多个参数的时候，给它们加上@Param注解（注意不要引错包）

## 五、resultMap配置
todo