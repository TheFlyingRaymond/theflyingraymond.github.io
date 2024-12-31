---
icon: pen-to-square
date: 2024-12-30
category:
  - MyBatis
tag:
  - 支线
---

# MyBatis使用3：动态SQL

动态SQL的使用

<!-- more -->

## 一、If
```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG
  WHERE
  <if test="state != null">
    state = #{state}
  </if>
  <if test="title != null">
    AND title like #{title}
  </if>
  <if test="author != null and author.name != null">
    AND author_name like #{author.name}
  </if>
</select>
```
注意几点：
- 如果title是基本数据类型（有默认值），那title!=null会永远为true
- 只用if可能造成语法错误（当state==null时，where开头有个and），一般配合where或者trim等使用
- test支持OGNL表达式

## 二、trim、where、set
现在用解决上面if中提到的那个语法错误的问题
```xml
<select id="findActiveBlogLike" resultType="Blog">
  SELECT * FROM BLOG
  <trim prefix="WHERE" prefixOverrides="AND |OR ">
    <if test="state != null">
      AND state = #{state}
    </if>
    <if test="title != null">
      AND title like #{title}
    </if>
    <if test="author != null and author.name != null">
      AND author_name like #{author.name}
    </if>
	</trim>
</select>
```
四个属性：
- prefix：前缀
- prefixOverrides：需要干掉的开头
- suffix：后缀
- suffixOverrides：需要干掉的结尾

where和set都是trim的某种表现形式，算是快捷使用方式
```
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG
  <where>
    <if test="state != null">
         state = #{state}
    </if>
    <if test="title != null">
        AND title like #{title}
    </if>
    <if test="author != null and author.name != null">
        AND author_name like #{author.name}
    </if>
  </where>
</select>


<trim prefix="WHERE" prefixOverrides="AND |OR ">
  ...
</trim>
<update id="updateAuthorIfNecessary">
  update Author
    <set>
      <if test="username != null">username=#{username},</if>
      <if test="password != null">password=#{password},</if>
      <if test="email != null">email=#{email},</if>
      <if test="bio != null">bio=#{bio}</if>
    </set>
  where id=#{id}
</update>
<trim prefix="SET" suffixOverrides=",">
  ...
</trim>
```
## 三、choose、when、otherwise
类似java的switch
```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG WHERE state = ‘ACTIVE’
  <choose>
    <when test="title != null">
      AND title like #{title}
    </when>
    <when test="author != null and author.name != null">
      AND author_name like #{author.name}
    </when>
    <otherwise>
      AND featured = 1
    </otherwise>
  </choose>
</select>
```
## 四、foreach
```xml
<select id="selectPostIn" resultType="domain.blog.Post">
  SELECT *
  FROM POST P
  <where>
    <foreach item="item" index="index" collection="list"
        open="ID in (" separator="," close=")" nullable="true">
          #{item}
    </foreach>
  </where>
</select>
```
当集合是列表和数组等可迭代对象时，index是序号，item是值，当是map的时候，index是key，item是value
## 五、bind
```xml
<select id="selectBlogsLike" resultType="Blog">
  <bind name="pattern" value="'%' + _parameter.getTitle() + '%'" />
  SELECT * FROM BLOG
  WHERE title LIKE #{pattern}
</select>
```