var STORAGE_KEY = 'todos-vuejs-2.0';
var todos;
var todoStorage = {
    fetch:function(){
        var todos = JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
        todos.forEach(function(todo,index){
            todo.id = index;
        })
        todoStorage.uid = todos.length
        return todos;
    },
    save:function(todos){
        localStorage.setItem(STORAGE_KEY,JSON.stringify(todos));
    }
}
var filters = {
    all:function(todos){
        return todos;
    },
    active:function(todos){
        return todos.filter(function(todo){
            return !todo.completed
        })
    },
    completed:function(todos){
        return todos.filter(function(todo){
            return todo.completed;
        })
    }
}
var app = new Vue({
    //这里的对象将被Vue代理,通过defineProperty重新定义,来跟踪数据的修改.
    //同时也跟踪可修改自身的数组方法,和对象的setter
    //在tpl中和这些数据进行绑定,试图会自动修改.
    //在节点的属性中使用这些值,通过v-bind指令.在文本中使用这些值使用{{}}
    data:{
        todos:todoStorage.fetch(),
        newTodo:'',
        editedTodo:null,
        visibility:'all',
    },
    //在数据变化的同时提供watch观察者,handler为回调函数,还有其他一些参数
    watch:{
        todos:{
            handler:function(todos1){
                console.log(todos===this.todos);
                todoStorage.save(todos1);
            },
            //对象自己的值得变化,(数组变动不需要)
            deep:true
        }
    },
    //计算属性,可以当做一组提供getter方法的数据对象.只是会做缓存
    //通过属性访问器访问.
    computed:{
        filteredTodos:function(){
            return filters[this.visibility](this.todos)
        },
        remaining:function(){
            return filters.active(this.todos).length;
        },
        allDone:{
            get:function(){
                return this.remanining === 0;
            },
            set:function(value){
                this.todos.forEach(function(todo){
                    todo.completed = value;
                })
            }
        },
    },
    //自定义的过滤器,通过|操作
    filters:{
        pluralize:function(n){
            return n===1?'item':'items'
        }
    },
    //混入Vue实例中方法.可直接调用.
    methods:{
        addTodo:function(){
            var value = this.newTodo && this.newTodo.trim();
            todos === this.todos;
            if(!value){
                return;
            }
            this.todos.push({
                id:todoStorage.uid++,
                title:value,
                completed:false
            })
            this.newTodo = '';
        },
        removeTodo:function(todo){
            this.todos.splice(this.todos.indexOf(todo),1)
        },
        editedTodo:function(todo){
            this.beforeEditCache = todo.title;
            this.editedTodo = todo;
        },
        doneEdit:function(todo){
            if(!this.editedTodo){
                return;
            }
            this.editedTodo = null;
            todo.title = todo.title.trim();
            if(!todo.title){
                this.removeTodo(todo);
            }
        },
        cancelEdit:function(todo){
            this.editedTodo = null;
            todo.title = this.beforeEditCache;
        },
        removeCompleted:function(){
            this.todos = filters.active(this.todos);
        }
    },
    //自定义指令,
    //通过v-()操作,其中系统常用的v-on指令有可简写为@,通过指令+.添加指令修饰.通过:可以给一个参数.
    //提供有bind/inserted/update/等回调,有(el,binding,vnode,oldVnode)参数.
    //binding
    //且都有name(指令名称),
    //value(指令值 v-my-directive="1 + 1", value 的值是 2),指令的会自动让vue解析,所以这个value是个js的表达式.
    //oldValue: 指令绑定的前一个值，仅在 update 和 componentUpdated 钩子中可用。无论值是否改变都可用。
    //expression: 绑定值的字符串形式。 例如 v-my-directive="1 + 1" ， expression 的值是 "1 + 1"
    //arg: 传给指令的参数。例如 v-my-directive:foo， arg 的值是 "foo"
    //modifiers: 一个包含修饰符的对象。 例如： v-my-directive.foo.bar, 修饰符对象 modifiers 的值是 { foo: true, bar: true }
    //vnode虚拟节点
    //oldNode
    
    directives:{
        //自定义的指令
        //参数是一个对象,
        //如果直接传递函数,则是拦截的bind和update回调.
        'todo-focus':function(el,binding){
            if(binding){
                el.focus();
            }
        },
        'test':function(el,binding){
            console.log(binding);
        }
    }
})
function onHashChange(){
    var visibility = window.location.hash.replace(/#\/?/,'');
    if(filters[visibility]){
        app.visibility = visibility;
    }else{
        window.location.hash = '';
        app.visibility = 'all';
    }
}
window.addEventListener('hashchange',onHashChange);
app.$mount('.todoapp');

var testApp = new Vue({
    el:'.test',
    data:{
        test:'来自data的值',
        array:[],//也会观察数组的变异方法,
        obj:{test:1}//如果watch需要监听对象内容,则需要使用`deep`属性,且key需要在data中初始化.
    },
    watch:{
        obj:{
            handler:function(value){
                console.log('watch',value);
            },
            // deep:true
        }
    },
    computed:{
        test:function(v){
            // console.log(this.test);//将会导致递归调用
            return '来自计算方法';//覆盖了data中的属性.
        }
    },
    methods:{
        test1:function(){
            console.log('来自test1方法的值');//可以直接通过vue实例调用
        },
        test:function(){
            console.log('来自test方法的值');//data中的同名属性覆盖方法.
        }
    }
});